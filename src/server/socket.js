// Importing required modules
import net from 'net';
import _ from 'underscore';
import config from './config.js';
import logger from './logger.js';

// Managing connected clients
const connected = {
  count: 0,
  games: {},
};

// Function to update connection information
const whenConnected = (address) => {
  connected.count++;
  const key = `${address.host}:${address.port}`.toLowerCase();
  if (connected.games[key]) {
    connected.games[key]++;
  } else {
    connected.games[key] = 1;
  }
};

// Exporting connection management functions
export const connectedInfo = () => ({
  count: connected.count,
  games: _.sortBy(
    _.map(connected.games, (count, game) => ({ address: game, count })),
    'count'
  ).reverse(),
});

// Function to generate a random key
const makeKey = (length) => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Exporting the connection handler function
export const connection = (socket) => {
  let gameHost = config.moo.host;
  let gamePort = config.moo.port;
  
  if (socket.handshake?.query?.host) {
    gameHost = socket.handshake.query.host;
  }
  if (socket.handshake?.query?.port) {
    gamePort = socket.handshake.query.port;
  }

  socket.is_active = true;
  socket.game_address = { host: gameHost, port: gamePort };

  const moo = net.connect({ port: gamePort, host: gameHost }, (err) => {
    if (err) {
      logger.error(err);
      socket.is_active = false;
    } else {
      whenConnected(socket.game_address);
      socket.is_active = true;
      moo.mcp = {
        version: '?',
        handshake: false,
        packages: {},
        key: makeKey(8),
      };
      socket.emit('connected', new Date().toString());
    }
  });

  moo.on('data', (data) => {
    try {
      data = data.toString();
      if (!moo.mcp.handshake) {
        const lines = data.split('\r\n');
        data = '';
        lines.forEach((line) => {
          const mcpRegex = /#\$#mcp-?(?<protocol>[a-zA-Z\-]+)?(?: (?<key>[\d]+))?(?: (?<oob>[a-zA-Z]+):)?(?: (?<args>.+))?/;
          const mcpMatch = line.match(mcpRegex);
          if (!mcpMatch) {
            if (line) {
              data += `${line}\r\n`;
            }
            return;
          }

          const mcpArgs = mcpMatch.groups.args ? mcpMatch.groups.args.split(' ') : {};
          if (mcpMatch.groups.oob === 'version') {
            moo.mcp.version = mcpArgs[mcpArgs.length];
            moo.write(
              `#$#mcp authentication-key: ${moo.mcp.key} version: 1.0 to: 2.1\r\n`,
              'utf8'
            );
            return;
          }

          if (!mcpMatch.groups.oob && mcpMatch.groups.key !== moo.mcp.key) {
            console.error(
              `possible spoof detected; expected key ${moo.mcp.key} but got ${mcpMatch.groups.key} instead. Discarding '${line}'`
            );
            return;
          }

          switch (mcpMatch.groups.protocol) {
            case 'negotiate-can':
              moo.mcp.packages[mcpArgs[0]] = mcpArgs[mcpArgs.length - 1];
              break;
            case 'negotiate-end':
              moo.mcp.handshake = true;
              moo.write(
                `#$#mcp-negotiate-can ${moo.mcp.key} package: mcp-forward min-version: 1.0 max-version: 1.0\r\n`,
                'utf8'
              );
              moo.write(
                `#$#mcp-negotiate-can ${moo.mcp.key} package: dns-org-mud-moo-simpleedit min-version: 1.0 max-version: 2.0\r\n`,
                'utf8'
              );
              moo.write(`#$#mcp-negotiate-end ${moo.mcp.key}\r\n`, 'utf8');
              // const xForwardedFor = socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
              // const clientIp = xForwardedFor.split(',')[0];
              // moo.write(
                // `#$#mcp-forward-host ${moo.mcp.key} address: ${clientIp}\r\n`,
                // 'utf8'
              // );
              break;
          }
        });
      }

      if (data && socket.is_active) {
        socket.emit('data', data);
      }
    } catch (e) {
      logger.error('exception caught when receiving data from the moo', e);
    }
  });

  moo.on('end', () => {
    logger.debug('moo connect sent end');
    if (socket.is_active) {
      logger.debug('socket is active, sending disconnect and marking inactive');
      socket.is_active = false;
      socket.disconnect();
    } else {
      logger.debug('socket is no longer active');
    }
  });

  moo.on('error', (e) => {
    logger.error('moo error event occurred');
    logger.error(e);
    if (socket.is_active) {
      socket.emit('error', e);
    }
  });

  socket.on('error', (e) => {
    logger.error('socket error event occurred');
    logger.error(e);
  });

  socket.on('disconnecting', (reason) => {
    if (socket.is_active) {
      moo.write('@quit\r\n', 'utf8', () => {
        moo.end();
      });
    }
    socket.is_active = false;
    logger.debug('disconnected from client with reason:');
    logger.debug(reason);
  });

  socket.on('input', (command, inputCallback) => {
    if (command == null) {
      inputCallback(new Error('no input'));
    } else {
      try {
        moo.write(`${command}\r\n`, 'utf8', () => {
          socket.emit('status', `sent ${command.length} characters`);
          if (command === '@quit') {
            moo.end();
            socket.is_active = false;
            socket.disconnect();
          }
        });
        if (inputCallback) {
          inputCallback({
            status: `command sent from ${config.node.poweredBy} to moo at ${new Date().toString()}`,
          });
        }
      } catch (exception) {
        logger.error('exception while writing to moo');
        logger.error(exception);
        if (socket.is_active) {
          socket.emit('error', exception);
        }
      }
    }
  });
};
