import AnsiSequence from "./AnsiSequence";
import AnsiState from "../AnsiState";
import TextFragment from "../TextFragment";
import { deepClone } from "../../util";
import { ParserResult } from "..";

export default class ForegroundColorSequence extends AnsiSequence {
  code = [30, 31, 32, 33, 34, 35, 36, 37, 90, 91, 92, 93, 94, 95, 96, 97];
  selector = undefined;
  
  execute(stack: TextFragment[], openAnsiState: AnsiState, sequences: number[]) : ParserResult {
    let ansi_fragment = this.last_fragment(stack);
    ansi_fragment.ansi = deepClone(ansi_fragment.ansi);
    if (ansi_fragment.content.length > 0) {
      ansi_fragment = this.new_fragment(openAnsiState);
      stack.push(ansi_fragment);
    }
    
    switch (sequences[0]) {
      case 30: // Black
        ansi_fragment.ansi.foreground_color = '#000';
        break;
      case 31: // Red
        ansi_fragment.ansi.foreground_color = '#900';
        break;
      case 32: // Green
        ansi_fragment.ansi.foreground_color = '#090';
        break;
      case 33: // Yellow
        ansi_fragment.ansi.foreground_color = '#990';
        break;
      case 34: // Blue
        ansi_fragment.ansi.foreground_color = '#009';
        break;
      case 35: // Magenta
        ansi_fragment.ansi.foreground_color = '#909';
        break;
      case 36: // Cyan
        ansi_fragment.ansi.foreground_color = '#099';
        break;
      case 37: // White
        ansi_fragment.ansi.foreground_color = 'white';
        break;
      case 90: // Black
        ansi_fragment.ansi.foreground_color = '#000';
        break;
      case 91: // Bright Red
        ansi_fragment.ansi.foreground_color = '#F00';
        break;
      case 92: // Bright Green
        ansi_fragment.ansi.foreground_color = '#0f0';
        break;
      case 93: // Bright Yellow
        ansi_fragment.ansi.foreground_color = '#ff0';
        break;
      case 94: // Bright Blue
        ansi_fragment.ansi.foreground_color = '#00f';
        break;
      case 95: // Bright Magenta
        ansi_fragment.ansi.foreground_color = '#f0f';
        break;
      case 96: // Bright Cyan
        ansi_fragment.ansi.foreground_color = '#0ff';
        break;
      case 97: // Bright White
        ansi_fragment.ansi.foreground_color = '#fff';
        break;
    }

    return {
      stack,
      openAnsiState: ansi_fragment.ansi
    };
  }  
}