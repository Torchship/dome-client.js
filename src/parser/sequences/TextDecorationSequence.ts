import AnsiSequence from "./AnsiSequence";
import AnsiState from "../AnsiState";
import TextFragment from "../TextFragment";
import { deepClone } from "../../util";
import { ParserResult } from "..";

export default class TextDecorationSequence extends AnsiSequence {
  code = [2, 3, 4, 5, 6, 22, 24, 25];
  selector = undefined;
  
  execute(stack: TextFragment[], openAnsiState: AnsiState, sequences: number[]) : ParserResult {
    let ansi_fragment = this.last_fragment(stack);
    ansi_fragment.ansi = deepClone(ansi_fragment.ansi);
    if (ansi_fragment.content.length > 0) {
      ansi_fragment = this.new_fragment(openAnsiState);
      stack.push(ansi_fragment);
    }
    
    switch (sequences[0]) {
      case 2: // Faint
        ansi_fragment.ansi.weight = 'faint';
        break;
      case 3: // Italic
        ansi_fragment.ansi.is_italic = true;
        break;
      case 4: // Underline
        ansi_fragment.ansi.is_underline = true;
        break;
      case 5: // Slow blink
        ansi_fragment.ansi.blink = 'slow';
        break;
      case 6: // Rapid blink
        ansi_fragment.ansi.blink = 'rapid';
        break;
      case 22: // Normal intensity
        ansi_fragment.ansi.weight = 'normal';
        break;
      case 24: // Not underline 
        ansi_fragment.ansi.is_underline = false;
        break;
      case 25: // Not blinking
        ansi_fragment.ansi.blink = 'none';
        break;
    }
    
    return {
      stack,
      openAnsiState: ansi_fragment.ansi
    };
  }  
}