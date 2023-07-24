var net = require("net"),
  _ = require("underscore"),
  config = require("../lib/config"),
  logger = require("../lib/logger");

var connected = {
  count: 0,
  games: {},
};

var whenConnected = function (address) {
  connected.count++;
  var key = address.host + ":" + address.port;
  key = key.toLowerCase();
  if (connected.games[key]) {
    connected.games[key]++;
  } else {
    connected.games[key] = 1;
  }
};
exports = module.exports;

exports.connected = function () {
  return {
    count: connected.count,
    games: _.sortBy(
      _.map(connected.games, function (count, game) {
        return { address: game, count: count };
      }),
      "count"
    ).reverse(),
  };
};

function make_key(length) {
  var result = "";
  var characters = "0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// browser connecting via websocket
exports.connection = function (socket) {
  //console.log( socket.handshake.query );

  var gameHost = config.moo.host;
  var gamePort = config.moo.port;
  if (socket.handshake["query"] && socket.handshake.query["host"]) {
    gameHost = socket.handshake.query.host;
  }
  if (socket.handshake["query"] && socket.handshake.query["port"]) {
    gamePort = socket.handshake.query.port;
  }

  // open a network connection to the moo
  socket.is_active = true;
  socket.game_address = { host: gameHost, port: gamePort };

  const moo = net.connect({ port: gamePort, host: gameHost }, function (err) {
    // tell the other end of the connection that it connected successfully
    if (err) {
      logger.error(err);
      socket.is_active = false;
    } else {
      whenConnected(socket.game_address);
      socket.is_active = true;
      moo.mcp = {
        version: "?",
        handshake: false,
        packages: {},
        key: make_key(8),
      };
      socket.emit("connected", new Date().toString());
    }
  });

  // ** when receiving data from the moo
  moo.on("data", function (data) {
    try {
      data = data.toString();
      if (!moo.mcp.handshake) {
        lines = data.split("\r\n");
        data = "";
        for (var i = 0; i < lines.length; i++) {
          const mcpRegex =
            /#\$#mcp-?(?<protocol>[a-zA-Z\-]+)?(?: (?<key>[\d]+))?(?: (?<oob>[a-zA-Z]+):)?(?: (?<args>.+))?/;
          const mcpMatch = lines[i].match(mcpRegex);
          if (!mcpMatch) {
            // only pass non-MCP details on to client.
            if (lines[i]) {
              data += lines[i] + "\r\n";
            }
            continue;
          }

          const mcpArgs =
            mcpMatch.groups.args !== undefined
              ? mcpMatch.groups.args.split(" ")
              : {};
          if (mcpMatch.groups.oob == "version") {
            moo.mcp.version = mcpArgs[mcpArgs.length];
            moo.write(
              `#$#mcp authentication-key: ${moo.mcp.key} version: 1.0 to: 2.1\r\n`,
              "utf8"
            );
            continue;
          }

          if (!mcpMatch.groups.oob && mcpMatch.groups.key != moo.mcp.key) {
            console.error(
              `possible spoof detected; expected key ${moo.mcp.key} but got ${mcpMatch.groups.key} instead. Discarding '${lines[i]}'`
            );
            continue;
          }

          switch (mcpMatch.groups.protocol) {
            case "negotiate-can":
              moo.mcp.packages[mcpArgs[0]] = mcpArgs[mcpArgs.length - 1];
              break;
            case "negotiate-end":
              // we've completed our handshake.
              moo.mcp.handshake = true;
              moo.write(
                `#$#mcp-negotiate-can ${moo.mcp.key} package: mcp-forward min-version: 1.0 max-version: 1.0\r\n`,
                "utf8"
              );
              moo.write(
                `#$#mcp-negotiate-can ${moo.mcp.key} package: dns-org-mud-moo-simpleedit min-version: 1.0 max-version: 2.0\r\n`,
                "utf8"
              );
              moo.write(`#$#mcp-negotiate-end ${moo.mcp.key}\r\n`, "utf8");
              moo.write(
                `#$#mcp-forward-host ${moo.mcp.key} address: ${socket.handshake.address}\r\n`,
                "utf8"
              );
              break;
          }
        }
      }

      if (data && socket.is_active) {
        socket.emit("data", data);
      }
    } catch (e) {
      logger.error("exception caught when receiving data from the moo", e);
    }
  });

  moo.on("end", function () {
    logger.debug("moo connect sent end");
    if (socket.is_active) {
      logger.debug("socket is active, sending disconnect and marking inactive");
      socket.is_active = false;
      socket.disconnect();
    } else {
      logger.debug("socket is no longer active");
    }
  });

  moo.on("error", function (e) {
    logger.error("moo error event occurred");
    logger.error(e);
    if (socket.is_active) {
      socket.emit("error", e);
    }
  });

  socket.on("error", function (e) {
    logger.error("socket error event occurred");
    logger.error(e);
    // can't send this to the user
  });


  socket.on("disconnecting", function (reason) {
    if (socket.is_active) {
      moo.write( '@quit' + "\r\n", "utf8", function() {
        moo.end();
      });
    }
    socket.is_active = false;
    logger.debug("disconnected from client with reason:");
    logger.debug(reason);
  });

  // ** when receiving input from the websocket connected browser
  socket.on("input", function (command, inputCallback) {
    if (command == null) {
      // event received, but null or empty string
      inputCallback(new Error("no input"));
    } else {
      // write the command to the moo and finish with a line break
      try {
        moo.write(command + "\r\n", "utf8", function () {
          // we emit a status event back to the browser to confirm we've done our job
          socket.emit("status", "sent " + command.length + " characters");
          if (command == "@quit") {
            moo.end();
            socket.is_active = false;
            socket.disconnect();
          }
        });
        if (inputCallback)
          inputCallback({
            status:
              "command sent from " +
              config.node.poweredBy +
              " to moo at " +
              new Date().toString(),
          });
      } catch (exception) {
        logger.error("exception while writing to moo");
        logger.error(exception);
        if (socket.is_active) {
          socket.emit("error", exception);
        }
      }
    }
  });
};
