function BarGraph(ctx) {
    var startArr, endArr, self = this,
        looping = !1,
        loop = function() {
            var delta, animationComplete = !0;
            looping = !0;
            for (var i = 0; i < endArr.length; i += 1) delta = (endArr[i] - startArr[i]) / self.animationSteps, self.curArr[i] += delta, delta && (animationComplete = !1);
            animationComplete ? looping = !1 : (draw(self.curArr), setTimeout(loop, self.animationInterval / self.animationSteps))
        },
        draw = function(arr) {
            var barWidth, barHeight, ratio, maxBarHeight, i, numOfBars = arr.length,
                graphAreaWidth = self.width,
                graphAreaHeight = self.height;
            ctx.canvas.width === self.width && ctx.canvas.height === self.height || (ctx.canvas.width = self.width, ctx.canvas.height = self.height), ctx.clearRect(0, 0, self.width, self.height), barWidth = self.fixedBarWidth || graphAreaWidth / numOfBars - 2 * self.margin, maxBarHeight = graphAreaHeight - 1;
            var largestValue = 0;
            for (i = 0; i < arr.length; i += 1) arr[i] > largestValue && (largestValue = arr[i]);
            for (i = 0; i < arr.length; i += 1) ratio = self.maxValue ? arr[i] / self.maxValue : arr[i] / largestValue, barHeight = ratio * maxBarHeight, ctx.fillStyle = self.baseColor || "#333", ctx.fillRect(self.margin + i * self.width / numOfBars, graphAreaHeight - barHeight, barWidth, barHeight)
        };
    this.width = 300, this.height = 150, this.maxValue, this.fixedBarWidth = !1, this.margin = 5, this.curArr = [], this.baseColor = "#333", this.animationInterval = 1, this.animationSteps = 1, this.update = function(newArr) {
        self.curArr.length !== newArr.length ? (self.curArr = newArr, draw(newArr)) : (startArr = self.curArr, endArr = newArr, looping || loop())
    }
}
Date.prototype.formatDate = function(format) {
    var date = this,
        day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds();
    return format || (format = "MM/dd/yyyy"), format = format.replace("MM", month.toString().replace(/^(\d)$/, "0$1")), format.indexOf("yyyy") > -1 ? format = format.replace("yyyy", year.toString()) : format.indexOf("yy") > -1 && (format = format.replace("yy", year.toString().substr(2, 2))), format = format.replace("dd", day.toString().replace(/^(\d)$/, "0$1")), format.indexOf("t") > -1 && (format = hours > 11 ? format.replace("t", "pm") : format.replace("t", "am")), format.indexOf("HH") > -1 && (format = format.replace("HH", hours.toString().replace(/^(\d)$/, "0$1"))), format.indexOf("hh") > -1 && (hours > 12 && (hours -= 12), 0 === hours && (hours = 12), format = format.replace("hh", hours.toString().replace(/^(\d)$/, "$1"))), format.indexOf("mm") > -1 && (format = format.replace("mm", minutes.toString().replace(/^(\d)$/, "0$1"))), format.indexOf("ss") > -1 && (format = format.replace("ss", seconds.toString().replace(/^(\d)$/, "0$1"))), format
};
var dome = {},
    socket = null,
    defaultHeightOffset = "undefined" == typeof specialHeightOffset ? 50 : specialHeightOffset,
    MOO_STATUS_ENUM = {
        UNCHECKED: "UNCHECKED",
        UNKNOWN: "UNKNOWN",
        OK: "OK",
        WEBCLIENT_DOWN: "CLIENT_DOWN",
        WEBSITE_DOWN: "SITE_DOWN",
        MOO_OFFLINE: "MOO_DOWN",
        SEVERE_LAG: "LAG",
        NETWORK_ISSUE: "NETWORK"
    },
    SOCKET_STATE_ENUM = {
        RECONNECT_FAILED: -1,
        DISCONNECTED: 0,
        CONNECTED: 1,
        BEFORE_FIRST: 2
    };
dome.weakBrowser = function() {
    var chromeVersion = navigator.appVersion.match(/Chrome\/(\d+)/);
    return null != chromeVersion && parseInt(chromeVersion[1]) >= 79
}, dome.readPreferences = function() {
    var options = window.location.search || null,
        preferences = {
            commandSuggestions: !0,
            shortenUrls: !0,
            channelWindows: !1,
            godMode: !1,
            playDing: !0,
            localEcho: !1,
            colorSet: "acid",
            autoScroll: "dbl",
            edittheme: "twilight",
            lineBufferFont: "standard",
            imagePreview: !1,
            transparentOverlay: !1,
            broadSearch: !0,
            performanceBuffer: dome.weakBrowser() ? 1750 : 0
        };
    if (options) {
        if (-1 != options.indexOf("cs=false") && (preferences.commandSuggestions = !1), -1 != options.indexOf("su=false") && (preferences.shortenUrls = !1), -1 != options.indexOf("cw=true") && (preferences.channelWindows = !0), -1 != options.indexOf("gm=true") && (preferences.godMode = !0), -1 != options.indexOf("pd=false") && (preferences.playDing = !1), -1 != options.indexOf("le=true") && (preferences.localEcho = !0), -1 != options.indexOf("iv=true") && (preferences.imagePreview = !0), -1 != options.indexOf("as=long") ? preferences.autoScroll = "long" : -1 != options.indexOf("as=none") && (preferences.autoScroll = "none"), -1 != (ofIndex = options.indexOf("of="))) {
            var rest = of = options.substr(ofIndex);
            if (-1 != (n = rest.indexOf("&")) && (of = rest.substr(0, n)), of.length > 3) {
                var font = of.substr(3);
                _.contains(FONT_CHOICES, font) && (preferences.lineBufferFont = font)
            }
        }
        if (-1 != (etIndex = options.indexOf("et="))) {
            var rest = et = options.substr(etIndex);
            if (-1 != (n = rest.indexOf("&")) && (et = rest.substr(0, n)), et.length > 3) {
                var theme = et.substr(3);
                _.contains(EDIT_THEMES, theme) && (preferences.edittheme = theme)
            }
        }
        if (-1 != (clIndex = options.indexOf("cl="))) {
            var rest = cl = options.substr(clIndex);
            if (-1 != (n = rest.indexOf("&")) && (cl = rest.substr(0, n)), cl.length > 3) {
                var colorset = cl.substr(3);
                _.contains(COLORSET_CHOICES, colorset) && (preferences.colorSet = colorset)
            }
        }
        if (-1 != (pbIndex = options.indexOf("pb="))) {
            var rest = pb = options.substr(pbIndex); - 1 != (n = rest.indexOf("&")) && (pb = rest.substr(0, n)), pb = parseInt(pb), pb > 0 && (preferences.performanceBuffer = pb)
        } - 1 != options.indexOf("to=true") && (preferences.transparentOverlay = !0), -1 != options.indexOf("bs=false") && (preferences.broadSearch = !1)
    }
    return preferences
};
var PREFERENCE_ENUM = {
        cs: {
            name: "commandSuggestions",
            storeKey: "commands",
            def: !0
        },
        su: {
            name: "shortenUrls",
            storeKey: "shorten",
            def: !0
        },
        cw: {
            name: "channelWindows",
            storeKey: "channels",
            def: !1
        },
        gm: {
            name: "godMode",
            storeKey: "godmode",
            def: !1
        },
        pd: {
            name: "playDing",
            storeKey: "playding",
            def: !0
        },
        le: {
            name: "localEcho",
            storeKey: "localecho",
            def: !1
        },
        iv: {
            name: "imagePreview",
            storeKey: "imageview",
            def: !1
        },
        as: {
            name: "autoScroll",
            storeKey: "scroll",
            def: "dbl",
            valid: ["dbl", "long"]
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
            def: !1
        },
        bs: {
            name: "broadSearch",
            storeKey: "broadly",
            def: !0
        },
        pb: {
            name: "performanceBuffer",
            storeKey: "buffer",
            def: dome.weakBrowser() ? 1750 : 0
        }
    },
    helpDocs = ["Help on @client-option:\n", "  @client-options\n", "  @client-option &lt;option name&gt; [&lt;new value&gt;]\n", "\n", "  Options Include:\n"];
for (var shortCode in PREFERENCE_ENUM) {
    var prefName = PREFERENCE_ENUM[shortCode].name;
    PREFERENCE_ENUM[prefName] = PREFERENCE_ENUM[shortCode], helpDocs[helpDocs.length] = "   [" + shortCode + "] " + prefName + "\n"
}
var CLIENT_OPTION_NAME_ERROR = "Unknown @client-option specified, check @client-options\n",
    CLIENT_OPTION_VALUE_ERROR = "Invalid @client-option value, must be one of ",
    CLIENT_OPTIONS_HELP = helpDocs,
    showClientOptionHelp = function() {
        dome.buffer.append(CLIENT_OPTIONS_HELP)
    },
    translateClientOptionName = function(optionName) {
        return null != PREFERENCE_ENUM[optionName] ? PREFERENCE_ENUM[optionName].name : optionName
    },
    showClientOption = function(optionName) {
        var opts = _.keys(dome.preferences);
        if (optionName) {
            if (!_.has(dome.preferences, optionName)) return dome.buffer.append(CLIENT_OPTION_NAME_ERROR);
            opts = [optionName]
        }
        _.each(opts, function(opt) {
            dome.buffer.append("  " + opt + " : " + dome.preferences[opt] + "\n")
        })
    },
    setClientOption = function(optionName, optionValue) {
        if (!_.has(dome.preferences, optionName)) return dome.buffer.append(CLIENT_OPTION_NAME_ERROR);
        "true" == optionValue ? optionValue = !0 : "false" == optionValue && (optionValue = !1);
        var validValues = PREFERENCE_ENUM[optionName].valid || [!0, !1];
        if (!_.contains(validValues, optionValue)) return dome.buffer.append(CLIENT_OPTION_VALUE_ERROR + validValues.toString() + "\n");
        if (clientOptions && clientOptions.save(PREFERENCE_ENUM[optionName].storeKey, optionValue), dome.preferences[optionName] != optionValue) {
            if (dome.buffer.append("changing @client-option " + optionName + " to " + optionValue + "\n"), "colorSet" == optionName && (dome.buffer.removeClass("colorset-" + dome.preferences.colorSet), dome.inputReader.removeClass("colorset-" + dome.preferences.colorSet)), "lineBufferFont" == optionName && dome.buffer.removeClass(dome.preferences.lineBufferFont + "Text"), "transparentOverlay" == optionName) {
                var ac = $(".ui-autocomplete");
                null != ac && ac.removeClass(dome.preferences.transparentOverlay ? "ui-transparent-overlay" : "ui-opaque-overlay")
            }
            if (dome.preferences[optionName] = optionValue, "lineBufferFont" == optionName && dome.buffer.addClass(dome.preferences.lineBufferFont + "Text"), "colorSet" == optionName && "normal" != dome.preferences.colorSet && (dome.buffer.addClass("colorset-" + dome.preferences.colorSet), dome.inputReader.addClass("colorset-" + dome.preferences.colorSet)), "transparentOverlay" == optionName) {
                var ac = $(".ui-autocomplete");
                null != ac && ac.addClass(dome.preferences.transparentOverlay ? "ui-transparent-overlay" : "ui-opaque-overlay")
            }
            "broadSearch" == optionName && dome.preferences.commandSuggestions && (dome.inputReader && dome.inputReader.commandSuggestions("destroy"), dome.autoComplete && (dome.autoComplete(), dome.setupAutoComplete(dome.inputReader, dome.userType))), "commandSuggestions" == optionName && (dome.preferences.commandSuggestions ? dome.autoComplete && (dome.autoComplete(), dome.setupAutoComplete(dome.inputReader, dome.userType)) : dome.inputReader && dome.inputReader.commandSuggestions("destroy")), "localEcho" == optionName && dome.setEchoButton(dome.preferences.localEcho), "imagePreview" == optionName && dome.setImagesButton(dome.preferences.imagePreview)
        }
    };
dome.parseClientOptionCommand = function(command) {
    if (console.log(command), "@client-options" == command) return showClientOption();
    var commandParts = command.split(" ");
    if (commandParts.length < 2) return showClientOptionHelp();
    var optionName = translateClientOptionName(commandParts[1]);
    commandParts.length < 3 ? showClientOption(optionName) : setClientOption(optionName, commandParts[2])
}, dome.setupInputReader = function() {
    $(document).keydown(function(e) {
        if (190 == e.keyCode && (e.ctrlKey || e.metaKey)) return void dome.onToggleAutoScroll();
        if (191 == e.keyCode && (e.ctrlKey || e.metaKey)) return void dome.inputReader.focus();
        var elid = $(document.activeElement).is("input:focus, textarea:focus");
        return !(8 === e.keyCode && !elid) && void 0
    });
    var lastInput = "",
        commandBuffer = store.get("my-input-buffer") || [],
        commandPointer = commandBuffer.length || -1,
        getCursorPosition = function(textarea) {
            return "selectionStart" in textarea ? {
                start: textarea.selectionStart,
                end: textarea.selectionEnd
            } : {
                start: 1,
                end: 1
            }
        };
    if (dome.inputReader) {
        var inputReader = dome.inputReader;
        inputReader.on("keydown", function(event) {
            if (38 == event.which && commandPointer >= 0) {
                var cursor = getCursorPosition(inputReader[0]);
                return cursor.start != cursor.end || cursor.start < 150 && (commandPointer = (commandPointer <= -1 ? commandBuffer.length : commandPointer) - 1, inputReader.val(commandBuffer[commandPointer]), event.preventDefault()), !1
            }
            return 40 == event.which && commandPointer < commandBuffer.length - 1 ? (commandPointer = (commandPointer + 1 > commandBuffer.length ? 0 : commandPointer) + 1, inputReader.val(commandBuffer[commandPointer]), event.preventDefault(), !1) : 40 == event.which && commandPointer >= commandBuffer.length - 1 ? (commandPointer = commandBuffer.length, inputReader.val() == lastInput && "" != inputReader.val() ? (commandBuffer[commandBuffer.length] = inputReader.val(), commandBuffer.length > 2e3 && commandBuffer.shift(), commandPointer = commandBuffer.length, store.put("my-input-buffer", commandBuffer), inputReader.val(""), lastInput = "") : inputReader.val(lastInput), event.preventDefault(), !1) : void 0
        }), inputReader.on("keypress", function(event) {
            if (event.which, 13 == event.which && !event.shiftKey) {
                if (dome.autoComplete) try {
                    inputReader.commandSuggestions("close")
                } catch (e) {
                    console.log(e)
                }
                event.preventDefault();
                var command = inputReader.val();
                return socket.emit("input", command, function(state) {
                    dome.preferences.localEcho && dome.buffer.append('<span class="input-echo">&gt;' + command + "</span>\n"), dome.setFadeText && dome.statusDisplay && dome.setFadeText(dome.statusDisplay, state.status && 0 == state.status.indexOf("command sent") ? "SENT" : state.status, !1), command && 0 == command.indexOf("@client-option") && dome.parseClientOptionCommand && dome.parseClientOptionCommand(command)
                }), commandBuffer[commandBuffer.length] = inputReader.val(), commandBuffer.length > 2e3 && commandBuffer.shift(), commandPointer = commandBuffer.length, store.put("my-input-buffer", commandBuffer), inputReader.val(""), !1
            }
            setTimeout(function() {
                lastInput = inputReader.val()
            }, 5)
        }), inputReader.on("focus", function() {})
    }
}, dome.setupWindowHandlers = function() {
    dome.alert = {
        tone: new Audio("/notice.wav"),
        pattern: null,
        active: !1,
        titleProc: null
    }, dome.urlPatterns = {
        images: /png|jpg|gif|jpeg$/,
        videos: /mp4|gifv$/,
        youtube: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/
    }, dome.parseYouTubeID = function(url) {
        var match = url.match(dome.urlPatterns.youtube);
        return !(!match || 11 != match[7].length) && match[7]
    };
    var onUnloadHandler = function() {
            dome.socketState == SOCKET_STATE_ENUM.CONNECTED && socket.emit("input", "@quit\r\n")
        },
        onFocusHandler = function() {
            dome.alert.active = !1, null != dome.alert.titleProc && (window.clearInterval(dome.alert.titleProc), dome.alert.titleProc = null, document.title = dome.titleBarText), dome.inputReader && dome.inputReader.focus()
        };
    dome.setWindowTitle = function(newTitle) {
        document.title = dome.titleBarText = newTitle
    };
    var onBlurHandler = function() {
            dome.preferences.playDing && (dome.alert.active = !0)
        },
        defaultHeightOffset = "undefined" == typeof specialHeightOffset ? 50 : specialHeightOffset,
        onResizeHandler = function() {
            dome.client.css("height", window.innerHeight + "px"), dome.buffer.css("height", window.innerHeight - defaultHeightOffset + "px")
        },
        inViewport = function(jqElem) {
            var win = $(window),
                viewport = {
                    top: win.scrollTop(),
                    left: win.scrollLeft()
                };
            viewport.right = viewport.left + win.width(), viewport.bottom = viewport.top + win.height();
            var bounds = jqElem.offset();
            return bounds.right = bounds.left + jqElem.outerWidth(), bounds.bottom = bounds.top + jqElem.outerHeight(), !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom)
        },
        onScrollHandler = function() {
            var shownImages = $(".shown-image", dome.buffer);
            shownImages && shownImages.length && shownImages.each(function(idx, imageElem) {
                var image = $(imageElem);
                if (!inViewport(image)) {
                    var imageId = image.attr("id"),
                        control = $("#b" + imageId);
                    control.removeClass("icon-chevron-down"), control.addClass("icon-chevron-up");
                    $("SPAN#s" + imageId, dome.buffer).html("")
                }
            })
        },
        titleAlerted = !1,
        alertTitle = function() {
            titleAlerted ? (document.title = dome.titleBarText, titleAlerted = !1) : (document.title = "!! " + dome.titleBarText, titleAlerted = !0)
        };
    dome.windowAlert = function() {
        null == dome.alert.titleProc && (dome.alert.titleProc = window.setInterval(alertTitle, 500))
    };
    var iOS = !!navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
        winJQ = $(window);
    winJQ.on("focus", onFocusHandler), winJQ.on("blur", onBlurHandler), iOS || winJQ.on("resize", onResizeHandler), winJQ.on("orientationchange", onResizeHandler), winJQ.on("unload", onUnloadHandler), dome.buffer.on("scroll", onScrollHandler), onResizeHandler()
}, dome.setupOutputParser = function() {
    var editor = {},
        editorInit = function() {
            dome.activeEditor = editor = {
                readingContent: !1,
                buffer: "",
                editorName: "",
                uploadCommand: ""
            }
        };
    editorInit();
    var whoBox;
    dome.parseSocketData = function(segment) {
        var ts = new Date;
        if (editor.readingContent) {
            var terminalMarker = segment.lastIndexOf("\n.\r");
            if (-1 != terminalMarker || 0 == (terminalMarker = segment.indexOf(".\r\n"))) {
                editor.buffer += segment.substr(0, terminalMarker);
                var spawned = dome.makeEditor(editor);
                spawned && (dome.spawned[editor.editorName] = spawned, dome.updateEditorListView()), editorInit(), segment = segment.substr(terminalMarker + 4)
            } else editor.buffer += segment, segment = "";
            dome.setFadeText && dome.statusDisplay && dome.setFadeText(dome.statusDisplay, '<span class="warn">BUFFERING POPUP ...</span>')
        }
        var meta = -1;
        if (0 == (meta = segment.indexOf("#$#")) || (meta = segment.indexOf("\n#$#")) > 0) {
            var end = segment.indexOf("\r\n", meta),
                metaCommand = segment.substr(meta, end - meta),
                a = metaCommand.split(" upload: "),
                uploadCommand = a[a.length - 1];
            a = a[0].split(" name: ");
            var editorName = a[a.length - 1];
            if ("edit" == (metaCommand = a[0].substr(0 == meta ? 4 : 5))) {
                editorInit();
                var terminalMarker = segment.indexOf("\n.\r", end); - 1 != terminalMarker ? (dome.spawned[editorName] = dome.makeEditor({
                    editorName: editorName,
                    uploadCommand: uploadCommand,
                    buffer: segment.substr(end + 1, terminalMarker - end)
                }), dome.updateEditorListView(), segment = segment.substr(0, meta) + segment.substr(terminalMarker)) : (editor.readingContent = !0, editor.buffer += segment.substr(end + 1), editor.editorName = editorName, editor.uploadCommand = uploadCommand, segment = segment.substr(0, meta))
            } else metaCommand && 0 == metaCommand.indexOf("user") ? (dome.userType = a[0].substr(a[0].indexOf("user-type"), 12).split(" ")[1], segment = segment.substr(0, meta) + segment.substr(meta + a[0].length), dome.setupAutoComplete && dome.inputReader && dome.setupAutoComplete(dome.inputReader, dome.userType)) : "- PING!" == metaCommand ? (segment = segment.substr(0, meta) + segment.substr(meta + 13), dome.setFadeText && dome.statusDisplay && dome.setFadeText(dome.statusDisplay, "pinged")) : console && dome.setFadeText && dome.statusDisplay && dome.setFadeText(statusDisplay, metaCommand)
        }
        if (dome.channel && (channelMatches = dome.channel.pattern.exec(segment)) && null != (channel = dome.channel.getChannel(channelMatches[2]))) return void(channel.window ? channel.window.onChannelData(segment) : (channel = dome.channel.spawnChannel(channelMatches[2]), window.setTimeout(function() {
            channel.window.onChannelData(segment)
        }, 1e3)));
        if (_.each(subs, function(sub) {
                segment = segment.replace(sub.pattern, sub.replacement)
            }), segment = segment.replace(urlRegex, function(url) {
                0 != url.indexOf("http") && (url = "http://" + url);
                var out = '<a href="' + url + '" target="_blank">' + url + "</a>",
                    lowerURL = url.toLowerCase(),
                    isImage = lowerURL.match(dome.urlPatterns.images),
                    isVideo = lowerURL.match(dome.urlPatterns.videos),
                    isYouTube = dome.parseYouTubeID(url);
                if (isImage || isVideo || isYouTube) {
                    var imageId = "i" + (new Date).getTime() + "x" + Math.floor(1e6 * Math.random() + 1);
                    if (out += '<i id="b' + imageId + '" class="icon-white icon-chevron-' + (dome.preferences.imagePreview ? "down" : "up") + '" aria-hidden="true" style="cursor: pointer" onclick="dome.toggleImage(this, \'' + imageId + "', '" + url + "');\"></i>", out += '<span id="s' + imageId + '">', dome.preferences.imagePreview) {
                        if (out += '<br><a href="' + url + '" target="_blank">', isVideo) out += '<video class="shown-image" loop muted autoplay id="' + imageId + '" style="max-width: 75%">', out += '<source type="video/mp4" src="' + url.replace(/gifv$/, "mp4") + '">', out += "</video>";
                        else if (isYouTube) {
                            var width = Math.min(dome.buffer.width() - 20, 560),
                                height = Math.floor(.5652 * width);
                            out += '<iframe id="', out += imageId, out += '" class="shown-image" width="', out += width, out += '" height="', out += height, out += '" src="https://www.youtube.com/embed/', out += isYouTube, out += '" frameborder="0" allowfullscreen></iframe>'
                        } else out += '<img class="shown-image" id="' + imageId + '" src="' + url + '" style="max-width: 75%">';
                        out += "</a><br>"
                    }
                    out += "</span>"
                }
                return out
            }), segment = segment.replace(ip_regex, '<a href="https://whatismyipaddress.com/ip/$&" target="_new">$&</a>'), void 0 === whoBox && (whoBox = $("#who-table")), whoBox.length && (matches = segment.match(/\[\* SYS\-MSG \*\] ([\w]+)\/([\w]+) \((#[\d]+)\) has (connected|disconnected) [^(]+\(([\d]+)\)/i))) {
            if (dome.setFadeText && dome.statusDisplay && dome.setFadeText(dome.statusDisplay, matches[1] + "/" + matches[2] + " " + matches[4]), "disconnected" == matches[4]) $("#" + matches[2] + "-who").remove(), $("#how-many-connected").html("There are " + matches[5] + " connected");
            else if ("connected" == matches[4]) {
                var tempHtml = '<tr id="' + matches[2] + '-who"><td><a href="https://www.sindome.org/profile/' + matches[1] + '/" target="_blank"><img border="0" src="///www.sindome.org/bgbb/icon/' + matches[1] + '/pinky/image.png" title="' + matches[1] + '"></a></td><td><a data-who="' + matches[5] + '" href="javascript:void(0);">' + matches[3] + '</a></td><td class="who-name" title="' + matches[1] + " played by " + matches[2] + '"><a href="javascript:void(0);">' + matches[2] + "</a></td><td>0s</td></tr>";
                $(tempHtml).insertAfter(".who-header"), $("#how-many-connected").html("There are " + matches[5] + " connected")
            }
            if (dome.preferences.godMode) return
        }
        segment = segment.replace(/(\#\d+\b)/g, '<span class="all-copy">$1</span>'), segment = segment.replace(/(\$\w*)/g, '<span class="all-copy">$1</span>'), dome.alert && dome.alert.active && null != dome.alert.pattern && segment.match(dome.alert.pattern, "i") && (dome.alert.tone.play(), dome.windowAlert()), segment = segment.replace(/\n/g, "</div><br/><div>"), dome.buffer.append(segment);
        var kidCount = dome.buffer.contents().length,
            execDuration = (new Date).getTime() - ts.getTime();
        if (execDuration > 1 && console.log("slow buffer ... buffer length: " + kidCount + "  | duration: " + execDuration), dome.preferences.performanceBuffer > 0)
            for (; kidCount > dome.preferences.performanceBuffer;) dome.buffer.contents().first().remove(), kidCount = dome.buffer.contents().length;
        dome.pauseBuffer ? (dome.pausedLines++, dome.setFadeText && dome.statusDisplay && dome.setFadeText(dome.statusDisplay, dome.pausedLines + " UNREAD LINES")) : dome.buffer.animate({
            scrollTop: dome.buffer[0].scrollHeight
        }, 50)
    }
}, dome.setupSocket = function() {
    var onDisconnectedHandler = function() {
            console.log("disconnected"), dome.socketState != SOCKET_STATE_ENUM.CONNECTED && console.log("disconnected before we connected!"), dome.socketState = SOCKET_STATE_ENUM.DISCONNECTED, dome.activeEditor && (dome.activeEditor.readingContent = !1), dome.setFadeText && dome.statusDisplay && dome.setFadeText(dome.statusDisplay, "DISCONNECTED", !0), dome.disconnectView.overlay.removeClass("hide"), dome.disconnectView.buttonGroup.removeClass("hide")
        },
        onReconnectHandler = function() {
            dome.disconnectView.overlay.addClass("hide"), dome.disconnectView.buttonGroup.addClass("hide")
        },
        onReconnectFailedHandler = function() {
            dome.socketState = SOCKET_STATE_ENUM.RECONNECT_FAILED, dome.disconnectView.overlay.removeClass("hide"), dome.disconnectView.buttonGroup.removeClass("hide")
        },
        initialCommand = !1,
        onConnectedHandler = function() {
            dome.socketState == SOCKET_STATE_ENUM.DISCONNECTED && onReconnectHandler(), dome.socketState = SOCKET_STATE_ENUM.CONNECTED, dome.inputReader && dome.inputReader[0].focus(), dome.setFadeText && dome.statusDisplay && dome.setFadeText(dome.statusDisplay, "CONNECTED"), initialCommand || setTimeout(function() {
                var cmd;
                if (cmd = store.get("dc-initial-command")) dome.setWindowTitle && dome.setWindowTitle("Guest | " + gameName + " | " + poweredBy), dome.socket.emit("input", cmd, function() {
                    store.remove("dc-initial-command")
                });
                else if (cmd = store.get("dc-user-login")) {
                    var who = store.get("last-username");
                    dome.alert.pattern = new RegExp(who), dome.setWindowTitle && dome.setWindowTitle(who + " | " + gameName + " | " + poweredBy), dome.socket.emit("input", cmd, function() {})
                }
                dome.preferences.shortenUrls && dome.socket.emit("shorten-on", "shorten-on", function() {
                    console && console.log("enabling short urls")
                })
            }, 2e3), initialCommand = !0
        };
    return socket = io.connect("https:" == document.location.protocol ? socketUrlSSL : socketUrl, {
        "sync disconnect on unload": !0
    }), socket.on("connected", function(data) {
        onConnectedHandler()
    }), socket.on("disconnected", function(data) {
        onDisconnectedHandler()
    }), socket.on("reconnect_failed", function(data) {
        onReconnectFailedHandler()
    }), socket.on("error", function(e) {
        dome.onErrorHandler && dome.onErrorHandler(e)
    }), socket
}, dome.setupEditorSupport = function() {
    window.getSocket = function() {
        return dome.socket
    }, dome.makeEditor = function(editor) {
        var editWindow = null;
        if (_.has(dome.spawned, editor.editorName) && null != dome.spawned[editor.editorName] && (editWindow = dome.spawned[editor.editorName], editWindow.focus(), !editWindow.confirm("Replace existing editor of the same name? You may have active edits."))) return null;
        var type = "basic-readonly";
        editor.uploadCommand && (type = -1 != editor.uploadCommand.indexOf("@program") ? "verb" : "basic"), editor.type && (type = editor.type), editor.buffer = editor.buffer.replace(/^\n/, "").replace(/[\r\n]+$/, "");
        var editorURL = "/editor/" + type + "/?et=" + dome.preferences.edittheme + "&ts=" + (new Date).getTime();
        if (null != editWindow && _.has(editWindow, "updateEditor")) editWindow.updateEditor(editor.buffer);
        else {
            editWindow = window.open(editorURL, "" + editor.editorName, "width=640,height=480,resizeable,scrollbars")
        }
        return editWindow.editorData = editor, editWindow.uploadSocket = socket, editWindow.parentWindow = window, editWindow.focus(), editWindow
    }, dome.updateEditorListView = function() {
        var v = dome.editorListView;
        if (null == v) return void console.log("no editor list view");
        if (v.hide(), v.html(""), !_.isEmpty(dome.spawned)) {
            var listHTML = "<ul>";
            for (var title in dome.spawned)
                if (dome.spawned.hasOwnProperty(title)) {
                    var editWin = dome.spawned[title];
                    null != editWin && (listHTML += '<li data-editor="' + title + '">', listHTML += '<span data-editor="' + title + '" class="truncate" title="' + title + '">' + title + "</span>", listHTML += '<a data-editor="' + title + '" title="close editor" href="javascript:void(0);">', listHTML += '<i data-editor="' + title + '" class="glyph-button-close"></i></a></li>')
                } listHTML += "</ul>", v.html(listHTML), v.show()
        }
    };
    var editorListClicked = function(editorName, action) {
        console.log(editorName, action, dome.spawned[editorName]), null != dome.spawned[editorName] && (dome.spawned[editorName].focus(), "close" == action && (dome.spawned[editorName].close(), delete dome.spawned[editorName])), dome.updateEditorListView()
    };
    null != dome.editorListView && dome.editorListView.on("click", function(e) {
        if (e.currentTarget) {
            var $elem = $(e.target),
                editorName = $elem.data("editor");
            editorListClicked(editorName, "I" != e.target.tagName && "A" != e.target.tagName ? "zoom" : "close")
        }
    }), dome.editorClosed = function(editorName) {
        _.has(dome.spawned, editorName) && (delete dome.spawned[editorName], dome.updateEditorListView())
    }
}, dome.setupAutoscroll = function() {
    dome.pauseBuffer = !1, dome.pausedLines = 0;
    var longClickProc = null;
    dome.onToggleAutoScroll = function(event) {
        longClickProc = null, window.getSelection().removeAllRanges();
        var button = dome.scrollButton;
        dome.pauseBuffer ? (dome.pauseBuffer = !1, dome.pausedLines = 0, dome.setFadeText && dome.setFadeText(dome.statusDisplay, "SCROLLING RESUMED"), dome.buffer.animate({
            scrollTop: dome.buffer[0].scrollHeight
        }, 50), dome.buffer.removeClass("scroll-disabled"), button.html('<i class="icon-pause icon-white" aria-hidden="true"></i><span class="hidden-xs">PAUSE SCROLL</span>'), button.addClass("btn-primary"), button.removeClass("btn-danger"), $("#inputBuffer").focus()) : (dome.pauseBuffer = !0, dome.setFadeText && dome.setFadeText(dome.statusDisplay, "SCROLLING PAUSED"), dome.buffer.addClass("scroll-disabled"), button.html('<i class="icon-play icon-white" aria-hidden="true"></i><span class="hidden-xs">RESUME SCROLL</span>'), button.addClass("btn-danger"), button.removeClass("btn-primary"), $("#lineBuffer").focus(), console.log("line buffer focus", $("#lineBuffer")))
    }, "dbl" == dome.preferences.autoScroll ? (console.log("dblclick", dome.preferences.autoScroll), dome.buffer.on("dblclick", dome.onToggleAutoScroll)) : "long" == dome.preferences.autoScroll ? (dome.buffer.on("mousedown", function(event) {
        longClickProc = window.setTimeout(dome.onToggleAutoScroll, 2e3)
    }), dome.buffer.on("mouseup", function(event) {
        null != longClickProc && window.clearTimeout(longClickProc), longClickProc = null
    })) : dome.preferences.autoScroll
}, dome.setupButtons = function() {
    dome.setImagesButton = function(showImages) {
        dome.imagesButton && (dome.imagesButton.html(showImages ? '<i class="icon-eye-close icon-white" aria-hidden="true"></i><span class="hidden-xs">NO IMAGES</span>' : '<i class="icon-eye-open icon-white" aria-hidden="true"></i><span class="hidden-xs">IMAGES</span>'), showImages || $("I.icon-chevron-down", dome.buffer).trigger("click"))
    }, dome.imagesButton && dome.imagesButton.on("click", function() {
        dome.preferences.imagePreview = !dome.preferences.imagePreview, dome.setImagesButton(dome.preferences.imagePreview)
    }), dome.setEchoButton = function(showEcho) {
        dome.echoButton && dome.echoButton.html(showEcho ? '<i class="icon-volume-off icon-white" aria-hidden="true"></i><span class="hidden-xs">HIDE ECHO</span>' : '<i class="icon-volume-up icon-white" aria-hidden="true"></i><span class="hidden-xs">ECHO</span>')
    }, dome.echoButton && dome.echoButton.on("click", function() {
        dome.preferences.localEcho = !dome.preferences.localEcho, dome.setEchoButton(dome.preferences.localEcho)
    }), dome.reconnectButton && dome.reconnectButton.on("click", function() {
        window.location.reload()
    }), dome.saveButton && dome.saveButton.on("click", function() {
        var now = new Date,
            timestamp = "" + (now.getMonth() + 1) + now.getDate() + now.getFullYear() + now.getHours() + now.getMinutes(),
            form = $("#save-form");
        form.attr("action", "/save/buffer." + timestamp + ".html"), $("input", form).val(dome.buffer.html()), form.submit()
    }), dome.clearButton && dome.clearButton.on("click", function() {
        dome.buffer.html("")
    }), dome.scrollButton && dome.onToggleAutoScroll && dome.scrollButton.on("click", dome.onToggleAutoScroll), dome.closeAllButton && dome.closeAllButton.on("click", function() {
        if (dome.spawned)
            for (var i = 0; i < dome.spawned.length; i++) dome.spawned[i] && dome.spawned[i].close();
        if (dome.channels)
            for (var i = 0; i < dome.channels.length; i++) dome.channels[i].window && dome.channels[i].window.close();
        window.close()
    }), dome.attachImage = function(jqElem, imageId, url) {
        var isVideo = url.toLowerCase().match(/mp4|gifv$/),
            isYouTube = dome.parseYouTubeID(url),
            segment = '<br><a href="' + url + '" target="_blank">';
        if (isVideo) segment += '<video id="' + imageId + '" loop muted autoplay class="shown-image" style="max-width: 75%">', segment += '<source type="video/mp4" src="' + url.replace(/gifv$/, "mp4") + '">', segment += "</video>";
        else if (isYouTube) {
            var width = Math.min(dome.buffer.width() - 20, 560),
                height = Math.floor(.5652 * width);
            segment += '<iframe id="', segment += imageId, segment += '" class="shown-image" width="', segment += width, segment += '" height="', segment += height, segment += '" src="https://www.youtube.com/embed/', segment += isYouTube, segment += '" frameborder="0" allowfullscreen></iframe>'
        } else segment += '<img class="shown-image" id="' + imageId + '" src="' + url + '" style="max-width: 75%">';
        segment += "</a><br>", jqElem.html(segment)
    }, dome.toggleImage = function(elem, imageId, imageURL) {
        var control = $(elem),
            span = $("SPAN#s" + imageId, dome.buffer);
        if (!control.length || !span.length) return void console.log(control, span, imageId);
        control.hasClass("icon-chevron-down") ? (control.removeClass("icon-chevron-down"), control.addClass("icon-chevron-up"), span.html("")) : (control.removeClass("icon-chevron-up"), control.addClass("icon-chevron-down"), dome.attachImage(span, imageId, imageURL))
    }
}, dome.setupChannels = function() {
    dome.channel = {}, dome.channel.pattern = /(\[[\-|\+]\])\[([-A-Za-z]*)\] (.*)/g, dome.channelRegex = /(\[[\-|\+]\])\[([-A-Za-z]*)\] (.*)/g, dome.channel.substitution = {
        type: "channel",
        pattern: /(\<span class\=\"ansi\-[A-Za-z]*\"\>)(\[[\-|\+]\])\[([-A-Za-z]*)\] (.*)(\<\/span\>)/g,
        replacement: '$1<span data-channel-name="$3" title="click to have future $3 go to its own window" class="filterable">$2[$3]</span> $4$5'
    }, dome.preferences.channelWindows && (subs[subs.length] = dome.channel.substitution), dome.channel.onClickedChannel = function(channel) {
        var name = channel.data("channel-name");
        channel = dome.channel.spawnChannel(name), channel.window.focus()
    }, dome.channel.makeChannelWindow = function(name) {
        var channelWindow = window.open("/channel/" + name + "/?ts=" + (new Date).getTime(), "" + name, "width=640,height=480,resizeable,scrollbars");
        return channelWindow.channelName = name, channelWindow.uploadsocket = socket, channelWindow.parentWindow = window, channelWindow
    }, dome.channel.spawnChannel = function(name) {
        var channel = {};
        return null != (channel = dome.channel.getChannel(name)) && channel.window && null != channel.window ? channel.window.focus() : null == channel || channel.window && null != channel.window ? dome.channels[dome.channels.length] = channel = {
            name: name,
            window: dome.channel.makeChannelWindow(name)
        } : channel.window = dome.channel.makeChannelWindow(name), channel
    }, dome.channel.getChannel = function(name) {
        for (var i = 0; i < dome.channels.length; i++)
            if (dome.channels[i].name == name) return dome.channels[i];
        return null
    }, dome.buffer.on("click", function(event) {
        var elem = $(event.target);
        elem.hasClass("filterable") && dome.channel.onClickedChannel(elem)
    })
}, $.widget("custom.commandSuggestions", $.ui.autocomplete, {
    _renderItem: function(ul, item) {
        return $("<li>").data("item.autocomplete", item).data("custom-commandSuggestions", item).attr("data-value", item.value).addClass("ui-menu-item").append(item.display).appendTo(ul)
    },
    _resizeMenu: function() {
        var bestWidth = Math.min(dome.buffer.width() - 20, 800);
        this.menu.element.outerWidth(bestWidth)
    }
}), dome.autoCommands = [], dome.autoComplete = function() {
    var commandArgumentPattern = new RegExp(/<[-A-Z a-z]+>/, "g"),
        prettyCommandArguments = function(unformattedString) {
            return _.reduce(unformattedString.match(commandArgumentPattern), function(out, commandArg) {
                return out.replace(commandArg, "<i>&lt;" + commandArg.substring(1, commandArg.length - 1) + "&gt;</i>")
            }, unformattedString)
        };
    dome.autoCommands = [], dome.setupAutoComplete = function(inputBuffer, userType) {
        null == inputBuffer || window.location.query && -1 != window.location.query.indexOf("ac=no") || (dome.autoCommands.length > 0 && inputBuffer.commandSuggestions("destroy"), $.ajax({
            url: "/ac/" + userType,
            dataType: "json",
            success: function(data) {
                dome.autoCommands = _.reduce(data, function(out, line) {
                    var commandValue = line.trim(),
                        commandSearch = commandValue,
                        commandHelp = '<div class="command-syntax">' + commandValue + "</div>",
                        parts = commandValue.split("|");
                    if (parts.length > 1) {
                        commandValue = parts[0].trim();
                        var commandSyntax = commandSearch = commandValue,
                            commandParts = commandValue.split(" ");
                        commandParts.length > 1 && (commandValue = commandParts[0]), commandHelp = '<div class="command-syntax">' + prettyCommandArguments(commandSyntax) + "</div>";
                        var commandInstruction = parts[1].trim();
                        if (dome.preferences.broadSearch && (commandSearch += commandInstruction), commandHelp += '<div class="command-instruction">' + prettyCommandArguments(commandInstruction) + "</div>", parts.length > 2 && "" != parts[2]) {
                            var commandRequires = parts[2].trim();
                            dome.preferences.broadSearch && (commandSearch += commandRequires), commandHelp += '<div class="command-requires">' + commandRequires + "</div>"
                        }
                    }
                    return out[out.length] = {
                        label: commandSearch,
                        display: "<a>" + commandHelp + "</a>",
                        value: commandValue
                    }, out
                }, []), inputBuffer.commandSuggestions({
                    delay: 0,
                    minLength: 2,
                    position: {
                        my: "left bottom",
                        at: "left bottom",
                        of: "DIV#lineBuffer",
                        offset: "10 -20"
                    },
                    source: function(req, next) {
                        for (var term = new RegExp((2 == req.term.length ? "^" : "") + req.term), matches = [], i = 0; i < dome.autoCommands.length; i++) {
                            var item = dome.autoCommands[i];
                            term.test(item.label) && matches.push(item)
                        }
                        next(matches)
                    },
                    classes: {
                        "ui-autocomplete": dome.transparentOverlay ? "ui-transparent-overlay" : "ui-solid-overlay"
                    }
                })
            }
        }))
    }
}, dome.setupHealthCheck = function() {
    var showConnectionHelp = function(helpType) {
            console.log("showing help for: " + helpType)
        },
        troubleshootConnection = function(e) {
            var lastState = dome.gameHealth.state;
            return lastState == MOO_STATUS_ENUM.UNCHECKED ? "" : lastState == MOO_STATUS_ENUM.OK || lastState == MOO_STATUS_ENUM.UNKNOWN ? "ETIMEOUT" == e.code && dome.gameHealth.cpu > 98 ? (showConnectionHelp(MOO_STATUS_ENUM.SEVERE_LAG), "the moo is under heavy load and might not be able to respond in a timely manner") : "ENOTFOUND" == e.code || "ETIMEOUT" == e.code ? (showConnectionHelp(MOO_STATUS_ENUM.NETWORK_ISSUE), "unable to reach webclient server via socket, check your Internet connection") : "ECONNREFUSED" == e.code ? (showConnectionHelp("CHECK_FIREWALL"), "socket connection refused, behind a strict company or school firewall?") : (showConnectionHelp(MOO_STATUS_ENUM.NETWORK_ISSUE), "unexpected error while opening socket to webclient server: " + e.code) : (showConnectionHelp(lastState), dome.gameHealth.message)
        };
    dome.onErrorHandler = function(e) {
        var msg = "";
        e && (e.msg ? msg = e.msg : e.code && (msg = e.code), dome.socketState != SOCKET_STATE_ENUM.CONNECTED && (msg = troubleshootConnection(e))), e && console && console.log(e), msg && dome.statusDisplay && dome.setFadeText(dome.statusDisplay, "ERROR: " + msg, !0)
    }, dome.setFadeText = function(elem, msg) {
        msg = msg.toUpperCase(), elem.stop(!0, !0).html(msg).animate({
            opacity: "1"
        }, 500), arguments.length > 2 && arguments[2] || elem.delay(5e3).animate({
            opacity: "0"
        }, 1e3)
    };
    var lastGlobeClass = "ok",
        showingGameHealth = !1,
        clickedOpen = !1;
    dome.showGameHealth = function() {
        showingGameHealth || (showingGameHealth = !0, setTimeout(function() {
            showingGameHealth && dome.healthDetail.animate({
                left: 2
            }, 250)
        }, 25))
    }, dome.hideGameHealth = function() {
        clickedOpen || showingGameHealth && (showingGameHealth = !1, setTimeout(function() {
            showingGameHealth || dome.healthDetail.animate({
                left: -152
            }, 250)
        }, 25))
    }, dome.toggleGameHealth = function() {
        showingGameHealth && clickedOpen ? (clickedOpen = !1, dome.hideGameHealth()) : (clickedOpen = !0, dome.showGameHealth())
    };
    var createChartCanvas = function(id) {
            var canvas = document.createElement("canvas");
            return canvas.setAttribute("id", id), dome.healthDetail.append(canvas), canvas.getContext("2d")
        },
        cpuGraph = new BarGraph(createChartCanvas("cpu-graph"));
    cpuGraph.maxValue = 100, cpuGraph.margin = 0, cpuGraph.baseColor = "#F89406", cpuGraph.fixedBarWidth = 2, cpuGraph.width = 150, cpuGraph.height = 50;
    var memGraph = new BarGraph(createChartCanvas("mem-graph"));
    memGraph.maxValue = 512e6, memGraph.margin = 0, memGraph.baseColor = "#08C", memGraph.fixedBarWidth = 2, memGraph.width = 150, memGraph.height = 50;
    var userGraph = new BarGraph(createChartCanvas("user-graph"));
    userGraph.maxValue = 100, userGraph.margin = 0, userGraph.baseColor = "#8C0", userGraph.fixedBarWidth = 2, userGraph.width = 150, userGraph.height = 50;
    var detailedMOOStatus = document.createElement("div");
    detailedMOOStatus.setAttribute("class", "last-details"), dome.healthDetail.append(detailedMOOStatus);
    var setGameHealthDisplay = function(health) {
        dome.gameHealth.push(health), dome.gameHealth.length > 100 && dome.gameHealth.shift();
        var globeClass = "ok";
        health.state != MOO_STATUS_ENUM.OK && health.state != MOO_STATUS_ENUM.UNCHECKED ? globeClass = "fatal" : health.cpu > 98 && (globeClass = "warn");
        var mem = (health.memory / 1024 / 1024).toFixed(2),
            details = health.message + "<br>";
        if (health.cpu > 0 && (details += health.cpu + "% CPU consumption<br>"), health.memory > 0 && (details += mem + "MB RAM occupied<br>"), details += health.users + " users connected<br>", health.checked && (details += "Checked at " + new Date(health.checked).formatDate("hh:mm:ss t")), dome.healthDisplay.html('<i class="globe globe-' + globeClass + '" onmouseover="dome.showGameHealth();" onmouseout="dome.hideGameHealth()"></i>'), $(detailedMOOStatus).html(details), ("fatal" == globeClass || globeClass != lastGlobeClass && dome.setFadeText && dome.statusDisplay) && dome.setFadeText(dome.statusDisplay, health.message, "ok" != globeClass), dome.gameHealth) {
            for (var cpuValues = _.pluck(dome.gameHealth, "cpu"), memValues = _.pluck(dome.gameHealth, "memory"), userValues = _.pluck(dome.gameHealth, "users"); cpuValues.length < 100;) cpuValues.push(0);
            for (; memValues.length < 100;) memValues.push(0);
            for (; userValues.length < 100;) userValues.push(0);
            cpuGraph.update(cpuValues), memGraph.update(memValues), userGraph.update(userValues)
        }
        lastGlobeClass = globeClass
    };
    dome.healthDetail.on("mouseover", dome.showGameHealth), dome.healthDetail.on("mouseout", dome.hideGameHealth), dome.healthDetail.on("click", dome.toggleGameHealth);
    var updateMOOStatus = function() {
        0 != dome.preferences.performanceBuffer && (dome.perfBufferFlag.attr("title", "Scrollback limited to " + dome.preferences.performanceBuffer + " lines"), dome.perfBufferFlag.removeClass("hide")), $.get("/moo/status/", function(health) {
            setGameHealthDisplay(health)
        }, "json").error(function(err) {
            var health = {
                cpu: 0,
                memory: 0,
                checked: (new Date).getTime(),
                state: MOO_STATUS_ENUM.WEBCLIENT_DOWN,
                message: ""
            };
            err && err.code && ("ENOTFOUND" == err.code ? (health.state = MOO_STATUS_ENUM.NETWORK_ISSUE, health.message = "unable to reach webclient server, check your Internet connection") : "ETIMEDOUT" == err.code ? health.message = "unable to reach webclient server after a reasonable time, server may be offline" : "ECONNREFUSED" == err.code ? (health.state = MOO_STATUS_ENUM.NETWORK_ISSUE, health.message = "server connection refused, behind a strict company or school firewall?") : health.message = "error while connecting to webclient server: " + err.code), console && console.log(err), setGameHealthDisplay(health)
        })
    };
    setInterval(updateMOOStatus, 3e4), updateMOOStatus()
}, $(document).ready(function() {
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
            e.preventDefault()
        }
    }), dome.preferences = dome.readPreferences(), "standard" != dome.preferences.lineBufferFont && dome.buffer.removeClass("standardText").addClass(dome.preferences.lineBufferFont + "Text"), "normal" != dome.preferences.colorSet && dome.buffer.addClass("colorset-" + dome.preferences.colorSet), dome.setupChannels && dome.setupChannels(), dome.inputReader && (dome.setupInputReader && dome.setupInputReader(), dome.preferences.commandSuggestions && null != dome.autoComplete && (dome.autoComplete(), dome.setupAutoComplete(dome.inputReader, dome.userType))), dome.setupWindowHandlers && dome.setupWindowHandlers(), dome.setupEditorSupport && dome.setupEditorSupport(), dome.setupAutoscroll && dome.setupAutoscroll(), dome.setupButtons && dome.setupButtons(), dome.setupHealthCheck && dome.setupHealthCheck(), dome.setupOutputParser(), setTimeout(function() {
        dome.socket = dome.setupSocket(), dome.socket.on("data", dome.parseSocketData)
    }, 500)
});