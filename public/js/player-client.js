Date.prototype.formatDate = function(format) {
  var date = this, day = date.getDate(), month = date.getMonth() + 1, year = date.getFullYear(), hours = date.getHours(), minutes = date.getMinutes(), seconds = date.getSeconds();
  if (!format) {
      format = "MM/dd/yyyy";
  }
  format = format.replace("MM", month.toString().replace(/^(\d)$/, "0$1"));
  if (format.indexOf("yyyy") > -1) {
      format = format.replace("yyyy", year.toString());
  } else if (format.indexOf("yy") > -1) {
      format = format.replace("yy", year.toString().substr(2, 2));
  }
  format = format.replace("dd", day.toString().replace(/^(\d)$/, "0$1"));
  if (format.indexOf("t") > -1) {
      if (hours > 11) {
          format = format.replace("t", "pm");
      } else {
          format = format.replace("t", "am");
      }
  }
  if (format.indexOf("HH") > -1) {
      format = format.replace("HH", hours.toString().replace(/^(\d)$/, "0$1"));
  }
  if (format.indexOf("hh") > -1) {
      if (hours > 12) {
          hours -= 12;
      }
      if (hours === 0) {
          hours = 12;
      }
      format = format.replace("hh", hours.toString().replace(/^(\d)$/, "$1"));
  }
  if (format.indexOf("mm") > -1) {
      format = format.replace("mm", minutes.toString().replace(/^(\d)$/, "0$1"));
  }
  if (format.indexOf("ss") > -1) {
      format = format.replace("ss", seconds.toString().replace(/^(\d)$/, "0$1"));
  }
  return format;
};

var dome = {};

var socket = null;

var defaultHeightOffset = typeof specialHeightOffset == "undefined" ? 100 : specialHeightOffset;

var MOO_STATUS_ENUM = {
  UNCHECKED: "UNCHECKED",
  UNKNOWN: "UNKNOWN",
  OK: "OK",
  WEBCLIENT_DOWN: "CLIENT_DOWN",
  WEBSITE_DOWN: "SITE_DOWN",
  MOO_OFFLINE: "MOO_DOWN",
  SEVERE_LAG: "LAG",
  NETWORK_ISSUE: "NETWORK"
};

var SOCKET_STATE_ENUM = {
  RECONNECT_FAILED: -1,
  DISCONNECTED: 0,
  CONNECTED: 1,
  BEFORE_FIRST: 2
};

dome.weakBrowser = function() {
  var chromeVersion = navigator.appVersion.match(/Chrome\/(\d+)/);
  var badChrome = chromeVersion != null && parseInt(chromeVersion[1]) >= 79;
  return badChrome;
};

dome.readPreferences = function() {
  var options = window.location.search || null;
  var preferences = {
      commandSuggestions: true,
      shortenUrls: true,
      channelWindows: false,
      godMode: false,
      playDing: true,
      localEcho: false,
      colorSet: "acid",
      autoScroll: "dbl",
      edittheme: "twilight",
      lineBufferFont: "standard",
      imagePreview: false,
      transparentOverlay: false,
      broadSearch: true,
      performanceBuffer: dome.weakBrowser() ? 1750 : 0
  };
  if (options) {
      if (options.indexOf("cs=false") != -1) {
          preferences.commandSuggestions = false;
      }
      if (options.indexOf("su=false") != -1) {
          preferences.shortenUrls = false;
      }
      if (options.indexOf("cw=true") != -1) {
          preferences.channelWindows = true;
      }
      if (options.indexOf("gm=true") != -1) {
          preferences.godMode = true;
      }
      if (options.indexOf("pd=false") != -1) {
          preferences.playDing = false;
      }
      if (options.indexOf("le=true") != -1) {
          preferences.localEcho = true;
      }
      if (options.indexOf("iv=true") != -1) {
          preferences.imagePreview = true;
      }
      if (options.indexOf("as=long") != -1) {
          preferences.autoScroll = "long";
      } else if (options.indexOf("as=none") != -1) {
          preferences.autoScroll = "none";
      }
      if ((ofIndex = options.indexOf("of=")) != -1) {
          var rest = of = options.substr(ofIndex);
          if ((n = rest.indexOf("&")) != -1) {
              of = rest.substr(0, n);
          }
          if (of.length > 3) {
              var font = of.substr(3);
              if (_.contains(FONT_CHOICES, font)) {
                  preferences.lineBufferFont = font;
              }
          }
      }
      if ((etIndex = options.indexOf("et=")) != -1) {
          var rest = et = options.substr(etIndex);
          if ((n = rest.indexOf("&")) != -1) {
              et = rest.substr(0, n);
          }
          if (et.length > 3) {
              var theme = et.substr(3);
              if (_.contains(EDIT_THEMES, theme)) {
                  preferences.edittheme = theme;
              }
          }
      }
      if ((clIndex = options.indexOf("cl=")) != -1) {
          var rest = cl = options.substr(clIndex);
          if ((n = rest.indexOf("&")) != -1) {
              cl = rest.substr(0, n);
          }
          if (cl.length > 3) {
              var colorset = cl.substr(3);
              if (_.contains(COLORSET_CHOICES, colorset)) {
                  preferences.colorSet = colorset;
              }
          }
      }
      if ((pbIndex = options.indexOf("pb=")) != -1) {
          var rest = pb = options.substr(pbIndex);
          if ((n = rest.indexOf("&")) != -1) {
              pb = rest.substr(0, n);
          }
          pb = parseInt(pb);
          if (pb > 0) {
              preferences.performanceBuffer = pb;
          }
      }
      if (options.indexOf("to=true") != -1) {
          preferences.transparentOverlay = true;
      }
      if (options.indexOf("bs=false") != -1) {
          preferences.broadSearch = false;
      }
  }
  return preferences;
};

var PREFERENCE_ENUM = {
  cs: {
      name: "commandSuggestions",
      storeKey: "commands",
      def: true
  },
  su: {
      name: "shortenUrls",
      storeKey: "shorten",
      def: true
  },
  cw: {
      name: "channelWindows",
      storeKey: "channels",
      def: false
  },
  gm: {
      name: "godMode",
      storeKey: "godmode",
      def: false
  },
  pd: {
      name: "playDing",
      storeKey: "playding",
      def: true
  },
  le: {
      name: "localEcho",
      storeKey: "localecho",
      def: false
  },
  iv: {
      name: "imagePreview",
      storeKey: "imageview",
      def: false
  },
  as: {
      name: "autoScroll",
      storeKey: "scroll",
      def: "dbl",
      valid: [ "dbl", "long" ]
  },
  of: {
      name: "lineBufferFont",
      storeKey: "outfont",
      def: "standard",
      valid: FONT_CHOICES
  },
  et: {
      name: "edittheme",
      storeKey: "edittheme",
      def: "twilight",
      valid: EDIT_THEMES
  },
  cl: {
      name: "colorSet",
      storeKey: "colorset",
      def: "acid",
      valid: COLORSET_CHOICES
  },
  to: {
      name: "transparentOverlay",
      storeKey: "transparent",
      def: false
  },
  bs: {
      name: "broadSearch",
      storeKey: "broadly",
      def: true
  },
  pb: {
      name: "performanceBuffer",
      storeKey: "buffer",
      def: dome.weakBrowser() ? 1750 : 0
  }
};

var helpDocs = [ `Help on @client-option:${NEW_LINE}`, `  @client-options${NEW_LINE}`, `  @client-option &lt;option name&gt; [&lt;new value&gt;]${NEW_LINE}`, NEW_LINE, `  Options Include:${NEW_LINE}` ];

for (var shortCode in PREFERENCE_ENUM) {
  var prefName = PREFERENCE_ENUM[shortCode].name;
  PREFERENCE_ENUM[prefName] = PREFERENCE_ENUM[shortCode];
  helpDocs[helpDocs.length] = `[${shortCode}] ${prefName}${NEW_LINE}`;
}

var CLIENT_OPTION_NAME_ERROR = `Unknown @client-option specified, check @client-options${NEW_LINE}`;

var CLIENT_OPTION_VALUE_ERROR = "Invalid @client-option value, must be one of ";

var CLIENT_OPTIONS_HELP = helpDocs;

var showClientOptionHelp = function() {
  dome.buffer.append(CLIENT_OPTIONS_HELP);
};

var translateClientOptionName = function(optionName) {
  if (PREFERENCE_ENUM[optionName] != null) {
      return PREFERENCE_ENUM[optionName].name;
  }
  return optionName;
};

var showClientOption = function(optionName) {
  var opts = _.keys(dome.preferences);
  if (optionName) {
      if (!_.has(dome.preferences, optionName)) {
          return dome.buffer.append(CLIENT_OPTION_NAME_ERROR);
      }
      opts = [ optionName ];
  }
  _.each(opts, function(opt) {
      dome.buffer.append("  " + opt + " : " + dome.preferences[opt] + NEW_LINE);
  });
};

var setClientOption = function(optionName, optionValue) {
  if (!_.has(dome.preferences, optionName)) {
      return dome.buffer.append(CLIENT_OPTION_NAME_ERROR);
  }
  if (optionValue == "true") {
      optionValue = true;
  } else if (optionValue == "false") {
      optionValue = false;
  }
  var validValues = PREFERENCE_ENUM[optionName].valid || [ true, false ];
  if (!_.contains(validValues, optionValue)) {
      return dome.buffer.append(CLIENT_OPTION_VALUE_ERROR + validValues.toString() + NEW_LINE);
  }
  if (clientOptions) clientOptions.save(PREFERENCE_ENUM[optionName].storeKey, optionValue);
  if (dome.preferences[optionName] != optionValue) {
      dome.buffer.append("changing @client-option " + optionName + " to " + optionValue + "\n");
      if (optionName == "colorSet") {
          dome.buffer.removeClass("colorset-" + dome.preferences.colorSet);
          dome.inputReader.removeClass("colorset-" + dome.preferences.colorSet);
      }
      if (optionName == "lineBufferFont") dome.buffer.removeClass(dome.preferences.lineBufferFont + "Text");
      if (optionName == "transparentOverlay") {
          var ac = $(".ui-autocomplete");
          if (ac != null) {
              ac.removeClass(dome.preferences.transparentOverlay ? "ui-transparent-overlay" : "ui-opaque-overlay");
          }
      }
      dome.preferences[optionName] = optionValue;
      if (optionName == "lineBufferFont") dome.buffer.addClass(dome.preferences.lineBufferFont + "Text");
      if (optionName == "colorSet" && dome.preferences.colorSet != "normal") {
          dome.buffer.addClass("colorset-" + dome.preferences.colorSet);
          dome.inputReader.addClass("colorset-" + dome.preferences.colorSet);
      }
      if (optionName == "transparentOverlay") {
          var ac = $(".ui-autocomplete");
          if (ac != null) {
              ac.addClass(dome.preferences.transparentOverlay ? "ui-transparent-overlay" : "ui-opaque-overlay");
          }
      }
      if (optionName == "broadSearch" && dome.preferences.commandSuggestions) {
          if (dome.inputReader) dome.inputReader.commandSuggestions("destroy");
          if (dome.autoComplete) {
              dome.autoComplete();
              dome.setupAutoComplete(dome.inputReader, dome.userType);
          }
      }
      if (optionName == "commandSuggestions") {
          if (dome.preferences.commandSuggestions) {
              if (dome.autoComplete) {
                  dome.autoComplete();
                  dome.setupAutoComplete(dome.inputReader, dome.userType);
              }
          } else {
              if (dome.inputReader) dome.inputReader.commandSuggestions("destroy");
          }
      }
      if (optionName == "localEcho") {
          dome.setEchoButton(dome.preferences.localEcho);
      }
      if (optionName == "imagePreview") {
          dome.setImagesButton(dome.preferences.imagePreview);
      }
  }
};

dome.parseClientOptionCommand = function(command) {
  console.log(command);
  if (command == "@client-options") {
      return showClientOption();
  } else {
      var commandParts = command.split(" ");
      if (commandParts.length < 2) {
          return showClientOptionHelp();
      } else {
          var optionName = translateClientOptionName(commandParts[1]);
          if (commandParts.length < 3) {
              showClientOption(optionName);
          } else {
              setClientOption(optionName, commandParts[2]);
          }
      }
  }
};

dome.setupInputReader = function() {
  $(document).keydown(function(e) {
      if (e.keyCode == 190 && (e.ctrlKey || e.metaKey)) {
          dome.onToggleAutoScroll();
          return;
      } else if (e.keyCode == 191 && (e.ctrlKey || e.metaKey)) {
          dome.inputReader.focus();
          return;
      }
      var elid = $(document.activeElement).is("input:focus, textarea:focus");
      if (e.keyCode === 8 && !elid) {
          return false;
      }
  });
  var lastInput = "";
  var commandBuffer = store.get("my-input-buffer") || [];
  var commandPointer = commandBuffer.length || -1;
  var getCursorPosition = function(textarea) {
      if ("selectionStart" in textarea) {
          return {
              start: textarea.selectionStart,
              end: textarea.selectionEnd
          };
      } else {
          return {
              start: 1,
              end: 1
          };
      }
  };
  if (dome.inputReader) {
      var inputReader = dome.inputReader;
      inputReader.on("keydown", function(event) {
          if (event.which == 38 && commandPointer >= 0) {
              var cursor = getCursorPosition(inputReader[0]);
              if (cursor.start != cursor.end) {} else {
                  if (cursor.start < 150) {
                      commandPointer = (commandPointer <= -1 ? commandBuffer.length : commandPointer) - 1;
                      inputReader.val(commandBuffer[commandPointer]);
                      event.preventDefault();
                  } else {}
              }
              return false;
          } else if (event.which == 40 && commandPointer < commandBuffer.length - 1) {
              commandPointer = (commandPointer + 1 > commandBuffer.length ? 0 : commandPointer) + 1;
              inputReader.val(commandBuffer[commandPointer]);
              event.preventDefault();
              return false;
          } else if (event.which == 40 && commandPointer >= commandBuffer.length - 1) {
              commandPointer = commandBuffer.length;
              if (inputReader.val() == lastInput && inputReader.val() != "") {
                  commandBuffer[commandBuffer.length] = inputReader.val();
                  if (commandBuffer.length > 2e3) {
                      commandBuffer.shift();
                  }
                  commandPointer = commandBuffer.length;
                  store.put("my-input-buffer", commandBuffer);
                  inputReader.val("");
                  lastInput = "";
              } else {
                  inputReader.val(lastInput);
              }
              event.preventDefault();
              return false;
          }
      });
      inputReader.on("keypress", function(event) {
          if (event.which == 8) {}
          if (event.which == 13 && !event.shiftKey) {
              if (dome.autoComplete) {
                  try {
                      inputReader.commandSuggestions("close");
                  } catch (e) {
                      console.log(e);
                  }
              }
              event.preventDefault();
              var command = inputReader.val();
              socket.emit("input", command, function(state) {
                  if (dome.preferences.localEcho) {
                      dome.buffer.append('<span class="input-echo">&gt;' + command + "</span" + NEW_LINE);
                  }
                  if (dome.setFadeText && dome.statusDisplay) dome.setFadeText(dome.statusDisplay, state.status && state.status.indexOf("command sent") == 0 ? "SENT" : state.status, false);
                  if (command && command.indexOf("@client-option") == 0) {
                      if (dome.parseClientOptionCommand) dome.parseClientOptionCommand(command);
                  }
              });
              commandBuffer[commandBuffer.length] = inputReader.val();
              if (commandBuffer.length > 2e3) {
                  commandBuffer.shift();
              }
              commandPointer = commandBuffer.length;
              store.put("my-input-buffer", commandBuffer);
              inputReader.val("");
              return false;
          } else {
              setTimeout(function() {
                  lastInput = inputReader.val();
              }, 5);
          }
      });
      inputReader.on("focus", function() {});
  }
};

dome.setupWindowHandlers = function() {
  dome.alert = {
      tone: new Audio("/notice.wav"),
      pattern: null,
      active: false,
      titleProc: null
  };
  dome.urlPatterns = {
      images: /png|jpg|gif|jpeg$/,
      videos: /mp4|gifv$/,
      youtube: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
  };
  dome.parseYouTubeID = function(url) {
      var match = url.match(dome.urlPatterns.youtube);
      return match && match[7].length == 11 ? match[7] : false;
  };
  var onUnloadHandler = function() {
      if (dome.socketState == SOCKET_STATE_ENUM.CONNECTED) socket.emit("input", "@quit" + NEW_LINE);
  };
  var onFocusHandler = function() {
      dome.alert.active = false;
      if (dome.alert.titleProc != null) {
          window.clearInterval(dome.alert.titleProc);
          dome.alert.titleProc = null;
          document.title = dome.titleBarText;
      }
      if (dome.inputReader) {
          dome.inputReader.focus();
      }
  };
  dome.setWindowTitle = function(newTitle) {
      document.title = dome.titleBarText = newTitle;
  };
  var onBlurHandler = function() {
      if (dome.preferences.playDing) dome.alert.active = true;
  };
  var defaultHeightOffset = typeof specialHeightOffset == "undefined" ? 100 : specialHeightOffset;
  var onResizeHandler = function() {
      dome.client.css("height", "" + window.innerHeight + "px");
      dome.buffer.css("height", "" + (window.innerHeight - defaultHeightOffset) + "px");
  };
  var inViewport = function(jqElem) {
      var win = $(window);
      var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
      };
      viewport.right = viewport.left + win.width();
      viewport.bottom = viewport.top + win.height();
      var bounds = jqElem.offset();
      bounds.right = bounds.left + jqElem.outerWidth();
      bounds.bottom = bounds.top + jqElem.outerHeight();
      return !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom);
  };
  var onScrollHandler = function() {
      var shownImages = $(".shown-image", dome.buffer);
      if (shownImages && shownImages.length) {
          shownImages.each(function(idx, imageElem) {
              var image = $(imageElem);
              if (!inViewport(image)) {
                  var imageId = image.attr("id");
                  var control = $("#b" + imageId);
                  control.removeClass("icon-chevron-down");
                  control.addClass("icon-chevron-up");
                  var span = $("SPAN#s" + imageId, dome.buffer);
                  span.html("");
              }
          });
      }
  };
  var titleAlerted = false;
  var alertTitle = function() {
      if (!titleAlerted) {
          document.title = "!! " + dome.titleBarText;
          titleAlerted = true;
      } else {
          document.title = dome.titleBarText;
          titleAlerted = false;
      }
  };
  dome.windowAlert = function() {
      if (dome.alert.titleProc != null) {
          return;
      }
      dome.alert.titleProc = window.setInterval(alertTitle, 500);
  };
  var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;
  var winJQ = $(window);
  winJQ.on("focus", onFocusHandler);
  winJQ.on("blur", onBlurHandler);
  if (!iOS) {
      winJQ.on("resize", onResizeHandler);
  }
  winJQ.on("orientationchange", onResizeHandler);
  winJQ.on("unload", onUnloadHandler);
  dome.buffer.on("scroll", onScrollHandler);
  onResizeHandler();
};

dome.setupOutputParser = function() {
  var editor = {};
  var editorInit = function() {
      dome.activeEditor = editor = {
          readingContent: false,
          buffer: "",
          editorName: "",
          uploadCommand: ""
      };
  };
  editorInit();
  var whoBox;
  dome.parseSocketData = function(segment) {
      var ts = new Date();
      if (editor.readingContent) {
          var terminalMarker = segment.lastIndexOf(`\n.\r`);
          if (terminalMarker != -1 || (terminalMarker = segment.indexOf(".\r\n")) == 0) {
              editor.buffer += segment.substr(0, terminalMarker);
              var spawned = dome.makeEditor(editor);
              if (spawned) {
                  dome.spawned[editor.editorName] = spawned;
                  dome.updateEditorListView();
              }
              editorInit();
              segment = segment.substr(terminalMarker + 4);
          } else {
              editor.buffer += segment;
              segment = "";
          }
          if (dome.setFadeText && dome.statusDisplay) dome.setFadeText(dome.statusDisplay, '<span class="warn">BUFFERING POPUP ...</span>');
      }
      var meta = -1;
      if ((meta = segment.indexOf("#$#")) == 0 || (meta = segment.indexOf("\n#$#")) > 0) {
          var end = segment.indexOf("\r\n", meta);
          var metaCommand = segment.substr(meta, end - meta);
          var a = metaCommand.split(" upload: ");
          var uploadCommand = a[a.length - 1];
          a = a[0].split(" name: ");
          var editorName = a[a.length - 1];
          metaCommand = a[0].substr(meta == 0 ? 4 : 5);
          if (metaCommand == "edit") {
              editorInit();
              var terminalMarker = segment.indexOf("\n.\r", end);
              if (terminalMarker != -1) {
                  dome.spawned[editorName] = dome.makeEditor({
                      editorName: editorName,
                      uploadCommand: uploadCommand,
                      buffer: segment.substr(end + 1, terminalMarker - end)
                  });
                  dome.updateEditorListView();
                  segment = segment.substr(0, meta) + segment.substr(terminalMarker);
              } else {
                  editor.readingContent = true;
                  editor.buffer += segment.substr(end + 1);
                  editor.editorName = editorName;
                  editor.uploadCommand = uploadCommand;
                  segment = segment.substr(0, meta);
              }
          } else if (metaCommand && metaCommand.indexOf("user") == 0) {
              dome.userType = a[0].substr(a[0].indexOf("user-type"), 12).split(" ")[1];
              segment = segment.substr(0, meta) + segment.substr(meta + a[0].length);
              if (dome.setupAutoComplete && dome.inputReader) dome.setupAutoComplete(dome.inputReader, dome.userType);
          } else if (metaCommand == "- PING!") {
              segment = segment.substr(0, meta) + segment.substr(meta + 13);
              if (dome.setFadeText && dome.statusDisplay) dome.setFadeText(dome.statusDisplay, "pinged");
          } else {
              if (console) {
                  if (dome.setFadeText && dome.statusDisplay) dome.setFadeText(statusDisplay, metaCommand);
              }
          }
      }
      if (dome.channel && (channelMatches = dome.channel.pattern.exec(segment))) {
          if ((channel = dome.channel.getChannel(channelMatches[2])) != null) {
              if (channel["window"]) {
                  channel.window.onChannelData(segment);
              } else {
                  channel = dome.channel.spawnChannel(channelMatches[2]);
                  window.setTimeout(function() {
                      channel.window.onChannelData(segment);
                  }, 1e3);
              }
              return;
          }
      }
      segment = segment
        .split(/\u001b\[0m/)
        .map(substring => {
          _.each(subs, function (sub) {
            substring = substring.replace(sub.pattern, sub.replacement);
          });
          if (ansiDepth) {
            substring += "</span>".repeat(ansiDepth);
            ansiDepth = 0;
          }
          return substring;
        })
        .join('');
      segment = segment.replace(urlRegex, function(url) {
          if (url.indexOf("http") != 0) {
              url = "http://" + url;
          }
          var out = '<a href="' + url + '" target="_blank">' + url + "</a>";
          var lowerURL = url.toLowerCase();
          var isImage = lowerURL.match(dome.urlPatterns.images);
          var isVideo = lowerURL.match(dome.urlPatterns.videos);
          var isYouTube = dome.parseYouTubeID(url);
          if (isImage || isVideo || isYouTube) {
              var imageId = "i" + new Date().getTime() + "x" + Math.floor(Math.random() * 1e6 + 1);
              out += '<i id="b' + imageId + '" class="icon-white icon-chevron-' + (dome.preferences.imagePreview ? "down" : "up") + '" aria-hidden="true" style="cursor: pointer" onclick="dome.toggleImage(this, \'' + imageId + "', '" + url + "');\"></i>";
              out += '<span id="s' + imageId + '">';
              if (dome.preferences.imagePreview) {
                  out += '<br><a href="' + url + '" target="_blank">';
                  if (isVideo) {
                      out += '<video class="shown-image" loop muted autoplay id="' + imageId + '" style="max-width: 75%">';
                      out += '<source type="video/mp4" src="' + url.replace(/gifv$/, "mp4") + '">';
                      out += "</video>";
                  } else if (isYouTube) {
                      var width = Math.min(dome.buffer.width() - 20, 560);
                      var height = Math.floor(width * .5652);
                      out += '<iframe id="';
                      out += imageId;
                      out += '" class="shown-image" width="';
                      out += width;
                      out += '" height="';
                      out += height;
                      out += '" src="https://www.youtube.com/embed/';
                      out += isYouTube;
                      out += '" frameborder="0" allowfullscreen></iframe>';
                  } else {
                      out += '<img class="shown-image" id="' + imageId + '" src="' + url + '" style="max-width: 75%">';
                  }
                  out += "</a><br>";
              }
              out += "</span>";
          }
          return out;
      });
      segment = segment.replace(ip_regex, '<a href="https://whatismyipaddress.com/ip/$&" target="_new">$&</a>');
      if (typeof whoBox == "undefined") {
          whoBox = $("#who-table");
      }
      if (whoBox.length) {
          if (matches = segment.match(/\[\* SYS\-MSG \*\] ([\w]+)\/([\w]+) \((#[\d]+)\) has (connected|disconnected) [^(]+\(([\d]+)\)/i)) {
              if (dome.setFadeText && dome.statusDisplay) dome.setFadeText(dome.statusDisplay, matches[1] + "/" + matches[2] + " " + matches[4]);
              if (matches[4] == "disconnected") {
                  $("#" + matches[2] + "-who").remove();
                  $("#how-many-connected").html("There are " + matches[5] + " connected");
              } else if (matches[4] == "connected") {
                  var tempHtml = '<tr id="' + matches[2] + '-who"><td><a href="https://www.sindome.org/profile/' + matches[1] + '/" target="_blank"><img border="0" src="///www.sindome.org/bgbb/icon/' + matches[1] + '/pinky/image.png" title="' + matches[1] + '"></a></td><td><a data-who="' + matches[5] + '" href="javascript:void(0);">' + matches[3] + '</a></td><td class="who-name" title="' + matches[1] + " played by " + matches[2] + '"><a href="javascript:void(0);">' + matches[2] + "</a></td><td>0s</td></tr>";
                  $(tempHtml).insertAfter(".who-header");
                  $("#how-many-connected").html("There are " + matches[5] + " connected");
              }
              if (dome.preferences.godMode) {
                  return;
              }
          }
      }
      segment = segment.replace(/(\#\d+\b)/g, '<span class="all-copy">$1</span>');
      segment = segment.replace(/(\$\w*)/g, '<span class="all-copy">$1</span>');
      if (dome.alert && dome.alert.active && dome.alert.pattern != null) {
          if (segment.match(dome.alert.pattern, "i")) {
              dome.alert.tone.play();
              dome.windowAlert();
          }
      }
      segment = segment.replace(NEW_LINE, "</div><br/><div>");
      dome.buffer.append(segment);
      var kidCount = dome.buffer.contents().length;
      var execDuration = new Date().getTime() - ts.getTime();
      if (execDuration > 1) {
          console.log("slow buffer ... buffer length: " + kidCount + "  | duration: " + execDuration);
      }
      if (dome.preferences.performanceBuffer > 0) {
          while (kidCount > dome.preferences.performanceBuffer) {
              dome.buffer.contents().first().remove();
              kidCount = dome.buffer.contents().length;
          }
      }
      if (dome.pauseBuffer) {
          dome.pausedLines++;
          if (dome.setFadeText && dome.statusDisplay) dome.setFadeText(dome.statusDisplay, "" + dome.pausedLines + " UNREAD LINES");
      } else {
          dome.buffer.animate({
              scrollTop: dome.buffer[0].scrollHeight
          }, 50);
      }
  };
};

dome.setupSocket = function() {
  var onDisconnectedHandler = function() {
      console.log("disconnected");
      if (dome.socketState != SOCKET_STATE_ENUM.CONNECTED) {
          console.log("disconnected before we connected!");
      }
      dome.socketState = SOCKET_STATE_ENUM.DISCONNECTED;
      if (dome.activeEditor) {
          dome.activeEditor.readingContent = false;
      }
      if (dome.setFadeText && dome.statusDisplay) dome.setFadeText(dome.statusDisplay, "DISCONNECTED", true);
      dome.disconnectView.overlay.removeClass("hide");
      dome.disconnectView.buttonGroup.removeClass("hide");
  };
  var onReconnectHandler = function() {
      dome.disconnectView.overlay.addClass("hide");
      dome.disconnectView.buttonGroup.addClass("hide");
  };
  var onReconnectFailedHandler = function() {
      dome.socketState = SOCKET_STATE_ENUM.RECONNECT_FAILED;
      dome.disconnectView.overlay.removeClass("hide");
      dome.disconnectView.buttonGroup.removeClass("hide");
  };
  var initialCommand = false;
  var onConnectedHandler = function() {
      if (dome.socketState == SOCKET_STATE_ENUM.DISCONNECTED) {
          onReconnectHandler();
      }
      dome.socketState = SOCKET_STATE_ENUM.CONNECTED;
      if (dome.inputReader) dome.inputReader[0].focus();
      if (dome.setFadeText && dome.statusDisplay) dome.setFadeText(dome.statusDisplay, "CONNECTED");
      if (!initialCommand) setTimeout(function() {
          var cmd;
          if (cmd = store.get("dc-initial-command")) {
              if (dome.setWindowTitle) dome.setWindowTitle("Guest | " + gameName + " | " + poweredBy);
              dome.socket.emit("input", cmd, function() {
                  store.remove("dc-initial-command");
              });
          } else if (cmd = store.get("dc-user-login")) {
              var who = store.get("last-username");
              dome.alert.pattern = new RegExp(who);
              if (dome.setWindowTitle) dome.setWindowTitle(who + " | " + gameName + " | " + poweredBy);
              dome.socket.emit("input", cmd, function() {});
          }
          if (dome.preferences.shortenUrls) {
              dome.socket.emit("shorten-on", "shorten-on", function() {
                  if (console) {
                      console.log("enabling short urls");
                  }
              });
          }
      }, 2e3);
      initialCommand = true;
  };
  socket = io.connect("https:" == document.location.protocol ? socketUrlSSL : socketUrl, {
      "sync disconnect on unload": true
  });
  socket.on("connected", function(data) {
      onConnectedHandler();
  });
  socket.on("disconnected", function(data) {
      onDisconnectedHandler();
  });
  socket.on("reconnect_failed", function(data) {
      onReconnectFailedHandler();
  });
  socket.on("error", function(e) {
      if (dome.onErrorHandler) dome.onErrorHandler(e);
  });
  return socket;
};

dome.setupEditorSupport = function() {
  window.getSocket = function() {
      return dome.socket;
  };
  dome.makeEditor = function(editor) {
      var editWindow = null;
      if (_.has(dome.spawned, editor.editorName) && dome.spawned[editor.editorName] != null) {
          editWindow = dome.spawned[editor.editorName];
          editWindow.focus();
          if (!editWindow.confirm("Replace existing editor of the same name? You may have active edits.")) {
              return null;
          }
      }
      var type = "basic-readonly";
      if (editor.uploadCommand) {
          if (editor.uploadCommand.indexOf("@program") != -1) {
              type = "verb";
          } else {
              type = "basic";
          }
      }
      if (editor["type"]) {
          type = editor["type"];
      }
      editor.buffer = editor.buffer.replace(/^\n/, "").replace(/[\r\n]+$/, "");
      var editorURL = "/editor/" + type + "/?et=" + dome.preferences.edittheme + "&ts=" + new Date().getTime();
      if (editWindow != null && _.has(editWindow, "updateEditor")) {
          editWindow.updateEditor(editor.buffer);
      } else {
          var windowConfig = "width=640,height=480,resizeable,scrollbars";
          editWindow = window.open(editorURL, "" + editor.editorName, windowConfig);
          editWindow.addEventListener("beforeunload", function() {
            delete dome.spawned[editor.editorName];
          }, false);
      }
      editWindow.editorData = editor;
      editWindow.uploadSocket = socket;
      editWindow.parentWindow = window;
      editWindow.focus();
      return editWindow;
  };
  dome.updateEditorListView = function() {
      var v = dome.editorListView;
      if (v == null) {
          console.log("no editor list view");
          return;
      }
      v.hide();
      v.html("");
      if (_.isEmpty(dome.spawned)) {
          return;
      }
      var listHTML = "<ul>";
      for (var title in dome.spawned) {
          if (!dome.spawned.hasOwnProperty(title)) {
              continue;
          }
          var editWin = dome.spawned[title];
          if (editWin != null) {
              listHTML += '<li data-editor="' + title + '">';
              listHTML += '<span data-editor="' + title + '" class="truncate" title="' + title + '">' + title + "</span>";
              listHTML += '<a data-editor="' + title + '" title="close editor" href="javascript:void(0);">';
              listHTML += '<i data-editor="' + title + '" class="glyph-button-close"></i></a></li>';
          }
      }
      listHTML += "</ul>";
      v.html(listHTML);
      v.show();
  };
  var editorListClicked = function(editorName, action) {
      console.log(editorName, action, dome.spawned[editorName]);
      if (dome.spawned[editorName] != null) {
          dome.spawned[editorName].focus();
          if (action == "close") {
              dome.spawned[editorName].close();
              delete dome.spawned[editorName];
          }
      }
      dome.updateEditorListView();
  };
  if (dome.editorListView != null) {
      dome.editorListView.on("click", function(e) {
          if (!e.currentTarget) {
              return;
          }
          var $elem = $(e.target);
          var editorName = $elem.data("editor");
          editorListClicked(editorName, e.target.tagName != "I" && e.target.tagName != "A" ? "zoom" : "close");
      });
  }
  dome.editorClosed = function(editorName) {
      if (_.has(dome.spawned, editorName)) {
          delete dome.spawned[editorName];
          dome.updateEditorListView();
      }
  };
};

dome.setupAutoscroll = function() {
  dome.pauseBuffer = false;
  dome.pausedLines = 0;
  var longClickProc = null;
  dome.onToggleAutoScroll = function(event) {
      longClickProc = null;
      window.getSelection().removeAllRanges();
      var button = dome.scrollButton;
      if (dome.pauseBuffer) {
          dome.pauseBuffer = false;
          dome.pausedLines = 0;
          if (dome.setFadeText) dome.setFadeText(dome.statusDisplay, "SCROLLING RESUMED");
          dome.buffer.animate({
              scrollTop: dome.buffer[0].scrollHeight
          }, 50);
          dome.buffer.removeClass("scroll-disabled");
          button.html('<i class="icon-pause icon-white" aria-hidden="true"></i><span class="hidden-xs">PAUSE SCROLL</span>');
          button.addClass("btn-primary");
          button.removeClass("btn-danger");
          $("#inputBuffer").focus();
      } else {
          dome.pauseBuffer = true;
          if (dome.setFadeText) {
              dome.setFadeText(dome.statusDisplay, "SCROLLING PAUSED");
          }
          dome.buffer.addClass("scroll-disabled");
          button.html('<i class="icon-play icon-white" aria-hidden="true"></i><span class="hidden-xs">RESUME SCROLL</span>');
          button.addClass("btn-danger");
          button.removeClass("btn-primary");
          $("#lineBuffer").focus();
          console.log("line buffer focus", $("#lineBuffer"));
      }
  };
  if (dome.preferences.autoScroll == "dbl") {
      console.log("dblclick", dome.preferences.autoScroll);
      dome.buffer.on("dblclick", dome.onToggleAutoScroll);
  } else if (dome.preferences.autoScroll == "long") {
      dome.buffer.on("mousedown", function(event) {
          longClickProc = window.setTimeout(dome.onToggleAutoScroll, 2e3);
      });
      dome.buffer.on("mouseup", function(event) {
          if (longClickProc != null) {
              window.clearTimeout(longClickProc);
          }
          longClickProc = null;
      });
  } else if (dome.preferences.autoScroll == "none") {}
};

dome.setupButtons = function() {
  dome.setImagesButton = function(showImages) {
      if (dome.imagesButton) {
          dome.imagesButton.html(showImages ? '<i class="icon-eye-close icon-white" aria-hidden="true"></i><span class="hidden-xs">NO IMAGES</span>' : '<i class="icon-eye-open icon-white" aria-hidden="true"></i><span class="hidden-xs">IMAGES</span>');
          if (!showImages) {
              $("I.icon-chevron-down", dome.buffer).trigger("click");
          }
      }
  };
  if (dome.imagesButton) {
      dome.imagesButton.on("click", function() {
          dome.preferences.imagePreview = !dome.preferences.imagePreview;
          dome.setImagesButton(dome.preferences.imagePreview);
      });
  }
  dome.setEchoButton = function(showEcho) {
      if (dome.echoButton) {
          dome.echoButton.html(showEcho ? '<i class="icon-volume-off icon-white" aria-hidden="true"></i><span class="hidden-xs">HIDE ECHO</span>' : '<i class="icon-volume-up icon-white" aria-hidden="true"></i><span class="hidden-xs">ECHO</span>');
      }
  };
  if (dome.echoButton) {
      dome.echoButton.on("click", function() {
          dome.preferences.localEcho = !dome.preferences.localEcho;
          dome.setEchoButton(dome.preferences.localEcho);
      });
  }
  if (dome.reconnectButton) {
      dome.reconnectButton.on("click", function() {
          window.location.reload();
      });
  }
  if (dome.saveButton) {
      dome.saveButton.on("click", function() {
          var now = new Date();
          var timestamp = "" + (now.getMonth() + 1) + now.getDate() + now.getFullYear() + now.getHours() + now.getMinutes();
          var form = $("#save-form");
          form.attr("action", "/save/buffer." + timestamp + ".html");
          $("input", form).val(dome.buffer.html());
          form.submit();
      });
  }
  if (dome.clearButton) {
      dome.clearButton.on("click", function() {
          dome.buffer.html("");
      });
  }
  if (dome.scrollButton && dome.onToggleAutoScroll) {
      dome.scrollButton.on("click", dome.onToggleAutoScroll);
  }
  if (dome.closeAllButton) {
      dome.closeAllButton.on("click", function() {
          if (dome.spawned) {
              for (var i = 0; i < dome.spawned.length; i++) {
                  if (dome.spawned[i]) {
                      dome.spawned[i].close();
                  }
              }
          }
          if (dome.channels) {
              for (var i = 0; i < dome.channels.length; i++) {
                  if (dome.channels[i]["window"]) {
                      dome.channels[i].window.close();
                  }
              }
          }
          window.close();
      });
  }
  dome.attachImage = function(jqElem, imageId, url) {
      var isVideo = url.toLowerCase().match(/mp4|gifv$/);
      var isYouTube = dome.parseYouTubeID(url);
      var segment = '<br><a href="' + url + '" target="_blank">';
      if (isVideo) {
          segment += '<video id="' + imageId + '" loop muted autoplay class="shown-image" style="max-width: 75%">';
          segment += '<source type="video/mp4" src="' + url.replace(/gifv$/, "mp4") + '">';
          segment += "</video>";
      } else if (isYouTube) {
          var width = Math.min(dome.buffer.width() - 20, 560);
          var height = Math.floor(width * .5652);
          segment += '<iframe id="';
          segment += imageId;
          segment += '" class="shown-image" width="';
          segment += width;
          segment += '" height="';
          segment += height;
          segment += '" src="https://www.youtube.com/embed/';
          segment += isYouTube;
          segment += '" frameborder="0" allowfullscreen></iframe>';
      } else {
          segment += '<img class="shown-image" id="' + imageId + '" src="' + url + '" style="max-width: 75%">';
      }
      segment += "</a><br>";
      jqElem.html(segment);
  };
  dome.toggleImage = function(elem, imageId, imageURL) {
      var control = $(elem);
      var span = $("SPAN#s" + imageId, dome.buffer);
      if (!control.length || !span.length) {
          console.log(control, span, imageId);
          return;
      } else if (control.hasClass("icon-chevron-down")) {
          control.removeClass("icon-chevron-down");
          control.addClass("icon-chevron-up");
          span.html("");
      } else {
          control.removeClass("icon-chevron-up");
          control.addClass("icon-chevron-down");
          dome.attachImage(span, imageId, imageURL);
      }
  };
};

dome.setupChannels = function() {
  dome.channel = {};
  dome.channel.pattern = /(\[[\-|\+]\])\[([-A-Za-z]*)\] (.*)/g;
  dome.channelRegex = /(\[[\-|\+]\])\[([-A-Za-z]*)\] (.*)/g;
  dome.channel.substitution = {
      type: "channel",
      pattern: /(\<span class\=\"ansi\-[A-Za-z]*\"\>)(\[[\-|\+]\])\[([-A-Za-z]*)\] (.*)(\<\/span\>)/g,
      replacement: '$1<span data-channel-name="$3" title="click to have future $3 go to its own window" class="filterable">$2[$3]</span> $4$5'
  };
  if (dome.preferences.channelWindows) {
      subs[subs.length] = dome.channel.substitution;
  }
  dome.channel.onClickedChannel = function(channel) {
      var name = channel.data("channel-name");
      channel = dome.channel.spawnChannel(name);
      channel.window.focus();
  };
  dome.channel.makeChannelWindow = function(name) {
      var windowConfig = "width=640,height=480,resizeable,scrollbars";
      var channelWindow = window.open("/channel/" + name + "/?ts=" + new Date().getTime(), "" + name, windowConfig);
      channelWindow.channelName = name;
      channelWindow.uploadsocket = socket;
      channelWindow.parentWindow = window;
      return channelWindow;
  };
  dome.channel.spawnChannel = function(name) {
      var channel = {};
      if ((channel = dome.channel.getChannel(name)) != null && channel["window"] && channel["window"] != null) {
          channel.window.focus();
      } else if (channel != null && (!channel["window"] || channel["window"] == null)) {
          channel.window = dome.channel.makeChannelWindow(name);
      } else {
          dome.channels[dome.channels.length] = channel = {
              name: name,
              window: dome.channel.makeChannelWindow(name)
          };
      }
      return channel;
  };
  dome.channel.getChannel = function(name) {
      for (var i = 0; i < dome.channels.length; i++) {
          if (dome.channels[i].name == name) {
              return dome.channels[i];
          }
      }
      return null;
  };
  dome.buffer.on("click", function(event) {
      var elem = $(event.target);
      if (elem.hasClass("filterable")) {
          dome.channel.onClickedChannel(elem);
      }
  });
};

$.widget("custom.commandSuggestions", $.ui.autocomplete, {
  _renderItem: function(ul, item) {
      return $("<li>").data("item.autocomplete", item).data("custom-commandSuggestions", item).attr("data-value", item.value).addClass("ui-menu-item").append(item.display).appendTo(ul);
  },
  _resizeMenu: function() {
      var bestWidth = Math.min(dome.buffer.width() - 20, 800);
      this.menu.element.outerWidth(bestWidth);
  }
});

dome.autoCommands = [];

dome.autoComplete = function() {
  var commandArgumentPattern = new RegExp(/<[-A-Z a-z]+>/, "g");
  var prettyCommandArguments = function(unformattedString) {
      return _.reduce(unformattedString.match(commandArgumentPattern), function(out, commandArg) {
          return out.replace(commandArg, "<i>&lt;" + commandArg.substring(1, commandArg.length - 1) + "&gt;</i>");
      }, unformattedString);
  };
  dome.autoCommands = [];
  dome.setupAutoComplete = function(inputBuffer, userType) {
      if (inputBuffer == null || window.location.query && window.location.query.indexOf("ac=no") != -1) {
          return;
      }
      if (dome.autoCommands.length > 0) {
          inputBuffer.commandSuggestions("destroy");
      }
      $.ajax({
          url: "/ac/" + userType,
          dataType: "json",
          success: function(data) {
              dome.autoCommands = _.reduce(data, function(out, line) {
                  var commandValue = line.trim();
                  var commandSearch = commandValue;
                  var commandHelp = '<div class="command-syntax">' + commandValue + "</div>";
                  var parts = commandValue.split("|");
                  if (parts.length > 1) {
                      commandValue = parts[0].trim();
                      var commandSyntax = commandSearch = commandValue;
                      var commandParts = commandValue.split(" ");
                      if (commandParts.length > 1) {
                          commandValue = commandParts[0];
                      }
                      commandHelp = '<div class="command-syntax">' + prettyCommandArguments(commandSyntax) + "</div>";
                      var commandInstruction = parts[1].trim();
                      if (dome.preferences.broadSearch) {
                          commandSearch += commandInstruction;
                      }
                      commandHelp += '<div class="command-instruction">' + prettyCommandArguments(commandInstruction) + "</div>";
                      if (parts.length > 2 && parts[2] != "") {
                          var commandRequires = parts[2].trim();
                          if (dome.preferences.broadSearch) {
                              commandSearch += commandRequires;
                          }
                          commandHelp += '<div class="command-requires">' + commandRequires + "</div>";
                      }
                  }
                  out[out.length] = {
                      label: commandSearch,
                      display: "<a>" + commandHelp + "</a>",
                      value: commandValue
                  };
                  return out;
              }, []);
              inputBuffer.commandSuggestions({
                  delay: 0,
                  minLength: 2,
                  position: {
                      my: "left bottom",
                      at: "left bottom",
                      of: "DIV#lineBuffer",
                      offset: "10 -20"
                  },
                  source: function(req, next) {
                      var term = new RegExp((req.term.length == 2 ? "^" : "") + req.term);
                      var matches = [];
                      for (var i = 0; i < dome.autoCommands.length; i++) {
                          var item = dome.autoCommands[i];
                          if (term.test(item.label)) matches.push(item);
                      }
                      next(matches);
                  },
                  classes: {
                      "ui-autocomplete": dome.transparentOverlay ? "ui-transparent-overlay" : "ui-solid-overlay"
                  }
              });
          }
      });
  };
};

function BarGraph(ctx) {
  var self = this;
  var startArr;
  var endArr;
  var looping = false;
  var loop = function() {
      var delta;
      var animationComplete = true;
      looping = true;
      for (var i = 0; i < endArr.length; i += 1) {
          delta = (endArr[i] - startArr[i]) / self.animationSteps;
          self.curArr[i] += delta;
          if (delta) {
              animationComplete = false;
          }
      }
      if (animationComplete) {
          looping = false;
      } else {
          draw(self.curArr);
          setTimeout(loop, self.animationInterval / self.animationSteps);
      }
  };
  var draw = function(arr) {
      var numOfBars = arr.length;
      var barWidth;
      var barHeight;
      var ratio;
      var maxBarHeight;
      var graphAreaWidth = self.width;
      var graphAreaHeight = self.height;
      var i;
      if (ctx.canvas.width !== self.width || ctx.canvas.height !== self.height) {
          ctx.canvas.width = self.width;
          ctx.canvas.height = self.height;
      }
      ctx.clearRect(0, 0, self.width, self.height);
      barWidth = self.fixedBarWidth || graphAreaWidth / numOfBars - self.margin * 2;
      maxBarHeight = graphAreaHeight - 1;
      var largestValue = 0;
      for (i = 0; i < arr.length; i += 1) {
          if (arr[i] > largestValue) {
              largestValue = arr[i];
          }
      }
      for (i = 0; i < arr.length; i += 1) {
          if (self.maxValue) {
              ratio = arr[i] / self.maxValue;
          } else {
              ratio = arr[i] / largestValue;
          }
          barHeight = ratio * maxBarHeight;
          ctx.fillStyle = self.baseColor || "#333";
          ctx.fillRect(self.margin + i * self.width / numOfBars, graphAreaHeight - barHeight, barWidth, barHeight);
      }
  };
  this.width = 300;
  this.height = 150;
  this.maxValue;
  this.fixedBarWidth = false;
  this.margin = 5;
  this.curArr = [];
  this.baseColor = "#333";
  this.animationInterval = 1;
  this.animationSteps = 1;
  this.update = function(newArr) {
      if (self.curArr.length !== newArr.length) {
          self.curArr = newArr;
          draw(newArr);
      } else {
          startArr = self.curArr;
          endArr = newArr;
          if (!looping) {
              loop();
          }
      }
  };
}

dome.setupHealthCheck = function() {
  var showConnectionHelp = function(helpType) {
      console.log("showing help for: " + helpType);
  };
  var troubleshootConnection = function(e) {
      var lastState = dome.gameHealth.state;
      if (lastState == MOO_STATUS_ENUM.UNCHECKED) {
          return "";
      } else if (lastState == MOO_STATUS_ENUM.OK || lastState == MOO_STATUS_ENUM.UNKNOWN) {
          if (e.code == "ETIMEOUT" && dome.gameHealth.cpu > 98) {
              showConnectionHelp(MOO_STATUS_ENUM.SEVERE_LAG);
              return "the moo is under heavy load and might not be able to respond in a timely manner";
          } else if (e.code == "ENOTFOUND" || e.code == "ETIMEOUT") {
              showConnectionHelp(MOO_STATUS_ENUM.NETWORK_ISSUE);
              return "unable to reach webclient server via socket, check your Internet connection";
          } else if (e.code == "ECONNREFUSED") {
              showConnectionHelp("CHECK_FIREWALL");
              return "socket connection refused, behind a strict company or school firewall?";
          } else {
              showConnectionHelp(MOO_STATUS_ENUM.NETWORK_ISSUE);
              return "unexpected error while opening socket to webclient server: " + e.code;
          }
      } else {
          showConnectionHelp(lastState);
      }
      return dome.gameHealth.message;
  };
  dome.onErrorHandler = function(e) {
      var msg = "";
      if (e) {
          if (e["msg"]) {
              msg = e.msg;
          } else if (e["code"]) {
              msg = e.code;
          }
          if (dome.socketState != SOCKET_STATE_ENUM.CONNECTED) {
              msg = troubleshootConnection(e);
          }
      }
      if (e && console) {
          console.log(e);
      }
      if (msg && dome.statusDisplay) {
          dome.setFadeText(dome.statusDisplay, "ERROR: " + msg, true);
      }
  };
  dome.setFadeText = function(elem, msg) {
      msg = msg.toUpperCase();
      elem.stop(true, true).html(msg).animate({
          opacity: "1"
      }, 500);
      if (arguments.length > 2 && arguments[2]) {
          return;
      }
      elem.delay(5e3).animate({
          opacity: "0"
      }, 1e3);
  };
  var lastGlobeClass = "ok";
  var showingGameHealth = false;
  var clickedOpen = false;
  dome.showGameHealth = function() {
      if (showingGameHealth) return;
      showingGameHealth = true;
      setTimeout(function() {
          if (!showingGameHealth) return;
          dome.healthDetail.animate({
              left: 2
          }, 250);
      }, 25);
  };
  dome.hideGameHealth = function() {
      if (clickedOpen) return;
      if (!showingGameHealth) return;
      showingGameHealth = false;
      setTimeout(function() {
          if (showingGameHealth) return;
          dome.healthDetail.animate({
              left: -152
          }, 250);
      }, 25);
  };
  dome.toggleGameHealth = function() {
      if (showingGameHealth && clickedOpen) {
          clickedOpen = false;
          dome.hideGameHealth();
      } else {
          clickedOpen = true;
          dome.showGameHealth();
      }
  };
  var createChartCanvas = function(id) {
      var canvas = document.createElement("canvas");
      canvas.setAttribute("id", id);
      dome.healthDetail.append(canvas);
      return canvas.getContext("2d");
  };
  var cpuGraph = new BarGraph(createChartCanvas("cpu-graph"));
  cpuGraph.maxValue = 100;
  cpuGraph.margin = 0;
  cpuGraph.baseColor = "#F89406";
  cpuGraph.fixedBarWidth = 2;
  cpuGraph.width = 150;
  cpuGraph.height = 50;
  var memGraph = new BarGraph(createChartCanvas("mem-graph"));
  memGraph.maxValue = 512e6;
  memGraph.margin = 0;
  memGraph.baseColor = "#08C";
  memGraph.fixedBarWidth = 2;
  memGraph.width = 150;
  memGraph.height = 50;
  var userGraph = new BarGraph(createChartCanvas("user-graph"));
  userGraph.maxValue = 100;
  userGraph.margin = 0;
  userGraph.baseColor = "#8C0";
  userGraph.fixedBarWidth = 2;
  userGraph.width = 150;
  userGraph.height = 50;
  var detailedMOOStatus = document.createElement("div");
  detailedMOOStatus.setAttribute("class", "last-details");
  dome.healthDetail.append(detailedMOOStatus);
  var setGameHealthDisplay = function(health) {
      dome.gameHealth.push(health);
      if (dome.gameHealth.length > 100) {
          dome.gameHealth.shift();
      }
      var globeClass = "ok";
      if (health.state != MOO_STATUS_ENUM.OK && health.state != MOO_STATUS_ENUM.UNCHECKED) {
          globeClass = "fatal";
      } else if (health.cpu > 98) {
          globeClass = "warn";
      }
      var mem = (health.memory / 1024 / 1024).toFixed(2);
      var details = health.message + "<br>";
      if (health.cpu > 0) {
          details += health.cpu + "% CPU consumption<br>";
      }
      if (health.memory > 0) {
          details += mem + "MB RAM occupied<br>";
      }
      details += health.users + " users connected<br>";
      if (health.checked) {
          details += "Checked at " + new Date(health.checked).formatDate("hh:mm:ss t");
      }
      dome.healthDisplay.html('<i class="globe globe-' + globeClass + '" onmouseover="dome.showGameHealth();" onmouseout="dome.hideGameHealth()"></i>');
      $(detailedMOOStatus).html(details);
      if (globeClass == "fatal" || globeClass != lastGlobeClass && (dome.setFadeText && dome.statusDisplay)) {
          dome.setFadeText(dome.statusDisplay, health.message, globeClass != "ok" ? true : false);
      }
      if (dome.gameHealth) {
          var cpuValues = _.pluck(dome.gameHealth, "cpu");
          var memValues = _.pluck(dome.gameHealth, "memory");
          var userValues = _.pluck(dome.gameHealth, "users");
          while (cpuValues.length < 100) {
              cpuValues.push(0);
          }
          while (memValues.length < 100) {
              memValues.push(0);
          }
          while (userValues.length < 100) {
              userValues.push(0);
          }
          cpuGraph.update(cpuValues);
          memGraph.update(memValues);
          userGraph.update(userValues);
      }
      lastGlobeClass = globeClass;
  };
  dome.healthDetail.on("mouseover", dome.showGameHealth);
  dome.healthDetail.on("mouseout", dome.hideGameHealth);
  dome.healthDetail.on("click", dome.toggleGameHealth);
  var updateMOOStatus = function() {
      if (dome.preferences.performanceBuffer != 0) {
          dome.perfBufferFlag.attr("title", "Scrollback limited to " + dome.preferences.performanceBuffer + " lines");
          dome.perfBufferFlag.removeClass("hide");
      }
      $.get("/moo/status/", function(health) {
          setGameHealthDisplay(health);
      }, "json").error(function(err) {
          var health = {
              cpu: 0,
              memory: 0,
              checked: new Date().getTime(),
              state: MOO_STATUS_ENUM.WEBCLIENT_DOWN,
              message: ""
          };
          if (err && err["code"]) {
              if (err.code == "ENOTFOUND") {
                  health.state = MOO_STATUS_ENUM.NETWORK_ISSUE;
                  health.message = "unable to reach webclient server, check your Internet connection";
              } else if (err.code == "ETIMEDOUT") {
                  health.message = "unable to reach webclient server after a reasonable time, server may be offline";
              } else if (err.code == "ECONNREFUSED") {
                  health.state = MOO_STATUS_ENUM.NETWORK_ISSUE;
                  health.message = "server connection refused, behind a strict company or school firewall?";
              } else {
                  health.message = "error while connecting to webclient server: " + err.code;
              }
          }
          if (console) {
              console.log(err);
          }
          setGameHealthDisplay(health);
      });
  };
  setInterval(updateMOOStatus, 3e4);
  updateMOOStatus();
};

$(document).ready(function() {
  dome = _.extend(dome, {
      userType: "p",
      socket: null,
      socketState: SOCKET_STATE_ENUM.BEFORE_FIRST,
      titleBarText: null,
      gameHealth: [],
      client: $("#browser-client"),
      buffer: $("#lineBuffer"),
      healthDisplay: $("#gameHealth"),
      healthDetail: $("#gameHealthDetail"),
      statusDisplay: $("#statusMsg"),
      editorListView: $("#editor-list-view"),
      inputReader: $("#inputBuffer"),
      reconnectButton: $("#button-reconnect"),
      saveButton: $("#button-save, #button-save-mini"),
      scrollButton: $("#button-auto-scroll"),
      clearButton: $("#button-clear-buffer"),
      echoButton: $("#button-local-echo"),
      imagesButton: $("#button-view-images"),
      closeAllButton: $("#button-closeall"),
      perfBufferFlag: $("#perf-buffer-flag"),
      disconnectView: {
          overlay: $("#disconnect-overlay"),
          buttonGroup: $(".disconnect-buttons")
      },
      spawned: {},
      channels: [],
      makeEditor: null,
      channel: null,
      refreshRecent: function(e) {
          e.preventDefault();
      }
  });
  dome.preferences = dome.readPreferences();
  if (dome.preferences.lineBufferFont != "standard") dome.buffer.removeClass("standardText").addClass(dome.preferences.lineBufferFont + "Text");
  if (dome.preferences.colorSet != "normal") dome.buffer.addClass("colorset-" + dome.preferences.colorSet);
  if (dome.setupChannels) dome.setupChannels();
  if (dome.inputReader) {
      if (dome.setupInputReader) dome.setupInputReader();
      if (dome.preferences.commandSuggestions && dome.autoComplete != null) {
          dome.autoComplete();
          dome.setupAutoComplete(dome.inputReader, dome.userType);
      }
  }
  if (dome.setupWindowHandlers) dome.setupWindowHandlers();
  if (dome.setupEditorSupport) dome.setupEditorSupport();
  if (dome.setupAutoscroll) dome.setupAutoscroll();
  if (dome.setupButtons) dome.setupButtons();
  if (dome.setupHealthCheck) dome.setupHealthCheck();
  dome.setupOutputParser();
  setTimeout(function() {
      dome.socket = dome.setupSocket();
      dome.socket.on("data", dome.parseSocketData);
  }, 500);
});