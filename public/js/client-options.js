var store = {
  direct: function () {
    return localStorage;
  },
  put: function (k, v) {
    try {
      if (localStorage) {
        return localStorage.setItem(k, JSON.stringify(v));
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  },
  get: function (k) {
    try {
      if (localStorage) {
        return JSON.parse(localStorage.getItem(k));
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  },
  remove: function (k) {
    try {
      if (localStorage) {
        localStorage.removeItem(k);
      }
    } catch (e) {
      console.log(e);
    }
  },
};

var EDIT_THEMES = [
  "ambience",
  "chaos",
  "chrome",
  "clouds",
  "clouds_midnight",
  "cobalt",
  "crimson_editor",
  "dawn",
  "dreamweaver",
  "eclipse",
  "github",
  "idle_fingers",
  "kr_theme",
  "merbivore",
  "merbivore_soft",
  "mono_industrial",
  "monokai",
  "pastel_on_dark",
  "solarized_dark",
  "solarized_light",
  "terminal",
  "textmate",
  "tomorrow_night",
  "tomorrow_night_blue",
  "tomorrow_night_bright",
  "tomorrow_night_eighties",
  "twilight",
  "vibrant_ink",
  "xcode",
];
var FONT_CHOICES = ["standard", "lucida", "courier", "roboto"];
var COLORSET_CHOICES = ["normal", "dim", "slither", "acid", "corpie", "snow"];

var clientOptions = {
  options: {
    commands: { param: "cs", def: true, ok: [true, false] },
    shorten: { param: "su", def: true, ok: [true, false] },
    scroll: { param: "as", def: "dbl", ok: ["dbl", "long", "none"] },
    channels: { param: "cw", def: false, ok: [true, false] },
    godmode: { param: "gm", def: false, ok: [true, false] },
    edittheme: { param: "et", def: "twilight", ok: EDIT_THEMES },
    colorset: { param: "cl", def: "normal", ok: COLORSET_CHOICES },
    outfont: { param: "of", def: "standard", ok: FONT_CHOICES },
    playding: { param: "pd", def: true, ok: [true, false] },
    localecho: { param: "le", def: false, ok: [true, false] },
    imageview: { param: "iv", def: false, ok: [true, false] },
    transparent: { param: "to", def: false, ok: [true, false] },
    broadly: { param: "bs", def: true, ok: [true, false] },
    buffer: { param: "pb", def: 0 },
  },
  prefix: "dc-toggle-", // namespacing options in localStorage
  get: function (name) {
    var option = this.options[name];
    if (!option) {
      throw new Error("invalid option name");
    }
    //console.log(this.prefix + name);
    var state = store.get(this.prefix + name);
    //console.log(state);
    if (state == null) {
      //console.log('using default');
      // if there is no state, set it to the default value
      state = option.def;
    }
    option["state"] = state == "true" ? true : state == "false" ? false : state;
    return option;
  },
  save: function (name, value) {
    var option = this.options[name];
    if (!option) {
      throw new Error("invalid option name");
    }
    store.put(this.prefix + name, value);
  },
  buildQueryString: function () {
    var qs = "";
    for (name in clientOptions.options) {
      var option = this.get(name);
      qs += qs == "" ? "" : "&";
      //console.log(option);
      qs += option.param + "=" + escape(option.state);
    }
    return qs;
  },
};

$(document).ready(function () {
  $("DIV.client-options-page DIV.option-row").each(function (i, row) {
    var row = $(this);
    var id = row.attr("id");
    var name = id.replace("-option", "");
    var option = clientOptions.get(name);
    var active = "disabled-state";
    if (!option.ok || option.state == option.ok[0]) {
      active = "enabled-state";
    }
    // give the active button the primary color
    var activeButton = $("BUTTON." + active, row);
    activeButton.addClass("btn-primary");
  });

  $("DIV.client-options-page DIV.option-row SELECT").each(function (i) {
    var self = $(this);

    var id = self.parent().attr("id").replace("-option", "");
    var option = clientOptions.get(id);
    $("option:selected", self).removeAttr("selected");
    var r = self.find('option[value="' + option.state + '"]');
    r.attr("selected", true);
    self.on("change", function () {
      var select = self;
      var value = select.val();
      clientOptions.save(id, value);
    });
  });

  $("DIV.client-options-page DIV.option-row BUTTON").each(function (i) {
    var self = $(this);
    self.on("click", function () {
      var btn = self;

      var val = btn.data("val");
      if (val == "true") {
        val = true;
      } else if (val == "false") {
        val = false;
      }

      var row = btn.parents("DIV.option-row");
      var name = row.attr("id").replace("-option", "");

      // find the other button matching this button
      otherBtn = $(
        btn.hasClass("enabled-state")
          ? "BUTTON.disabled-state"
          : "BUTTON.enabled-state",
        row
      );

      if (btn.hasClass("btn-primary")) {
        btn.removeClass("btn-primary");
        otherBtn.addClass("btn-primary");
      } else {
        otherBtn.removeClass("btn-primary");
        btn.addClass("btn-primary");
      }
      clientOptions.save(name, val);
    });
  });

  $("DIV.client-options-page DIV.option-row INPUT").each(function (i) {
    var self = $(this);

    var row = self.parents("DIV.option-row");
    var name = row.attr("id").replace("-option", "");

    var pref = clientOptions.get(name);
    if (pref && pref.state) {
      self.val(pref.state);
    }

    self.on("change", function () {
      var input = self;
      var fieldValue = input.val();
      if (input.attr("type") == "number")
        fieldValue =
          fieldValue.indexOf(".") != -1
            ? parseFloat(fieldValue)
            : parseInt(fieldValue);
      console.log("" + typeof fieldValue + ": " + fieldValue);

      clientOptions.save(name, fieldValue);
    });
  });
});
