self.onmessage = function(event) {
  var code = event.data.code;
  var command = event.data.command;
  
  if (command === 'init' || command === 'validate') {
      var annotations = validateCode(code);
      self.postMessage({ command: 'annotate', annotations: annotations });
  }
};

function validateCode(code) {
  // A simple validation for undefined variables.
  // This is basic and may produce false positives/negatives in a real-world scenario.
  var lines = code.split('\n');
  var definedVariables = ['this'];
  var annotations = [];

  for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      // This regex matches (hopefully) all variable definitions
      var matches = line.match(/(?:\{(?:([^,\}]+),?\s?)+\} = )|(?:([\w\d]+) = )|(?:for (?:([^\s,]+),? )+in)/g);
      if (matches) {
        matches.forEach(match => {
          console.log(match);
        });
      }
      // This regex should match variable usages
      matches = line.match(/(?:([\$\w\d]+)[\.|:])/g);
      if (matches) {
        matches.forEach(match => {
          if (definedVariables.includes(match))
            return;
          annotations.push({
            row: i,
            column: 0,
            text: `Variable ${match} is not defined.`,
            type: "warning"
          });
        })
      }
  }

  return annotations;
}
