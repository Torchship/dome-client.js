import AnsiState from "./AnsiState";
import AnsiSequence from "./sequences/AnsiSequence";
import BackgroundColorSequence from "./sequences/BackgroundColorSequence";
import ForegroundColorSequence from "./sequences/ForegroundColorSequence";
import TerminationSequence from "./sequences/TerminationSequence";
import TextDecorationSequence from "./sequences/TextDecorationSequence";
import XTermBackgroundSequence from "./sequences/XTermBackgroundSequence";
import XTermForegroundSequence from "./sequences/XTermForegroundSequence";
import TextFragment from "./TextFragment";

const SEQUENCES: AnsiSequence[] = [
  new TerminationSequence(),
  new ForegroundColorSequence(),
  new BackgroundColorSequence(),
  new TextDecorationSequence(),
  new XTermForegroundSequence(),
  new XTermBackgroundSequence()
];

export interface ParserResult {
  stack: TextFragment[],
  openAnsiState: AnsiState
}

export function parse(line: string, initialAnsiState: AnsiState): ParserResult {
  let c;
  let openAnsiState = initialAnsiState;
  let stack: TextFragment[] = [{content: '', ansi: openAnsiState}];

  for (let i=0; i < line.length;i++) {
    c = line[i];
    if (c === '\x1b' && i + 1 < line.length && line[i+1] === '[') {
      // Beginning of ANSI sequence
      let sequences = [];
      let sequence = '';
      let ansi_char;
      let n = i + 2;
      for (n; n < line.length; n++) {
        ansi_char = line[n];
        if (ansi_char === ';' && sequence) {
          sequences.push(parseInt(sequence));
          sequence = '';
          continue;
        } else if (ansi_char === 'm') {
          // terminate the ansi look-ahead as we found a proper escape code
          sequences.push(parseInt(sequence));
          sequence = '';
          break;
        }

        // sequence builder; when we're not doing a mode operation add the cur char to our
        // active sequence
        sequence += ansi_char;
      }

      // Check to see if we actually ended at a valid ANSI sequence terminator
      if (ansi_char !== 'm' || sequences.length <= 0) {
        // We did not.
        continue;
      }

      // Move the index ahead to after the escape sequence
      i = n;

      // Use sequences to determine wtf we're doing...
      const handler = SEQUENCES.find(s => {
        if (s.code === sequences[0] 
            || (Array.isArray(s.code) && s.code.includes(sequences[0]))) {

            if (s.selector !== undefined) {
              if (sequences.length <= 1) return false;
              if (s.selector !== sequences[1]) return false;
            }
          return true;
        }
        return false;
      });
      // const handler = SEQUENCES.find(s => Array.isArray(s.code) ? s.code.includes(sequences[0]) : s.code === sequences[0] 
      //   && (s.selector && sequences.length > 1 && s.selector === sequences[1]));
      if (!handler)
        continue;

      const result = handler.execute(stack, openAnsiState, sequences);
      stack = result.stack;
      openAnsiState = result.openAnsiState;

      // Move to the next operation
      continue;
    }

    stack[stack.length - 1].content += c;
  }

  return {
    stack,
    openAnsiState
  };
};