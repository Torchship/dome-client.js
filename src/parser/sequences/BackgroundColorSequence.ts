import AnsiSequence from "./AnsiSequence";
import AnsiState from "../AnsiState";
import TextFragment from "../TextFragment";
import { deepClone } from "../../util";
import { ParserResult } from "..";

export default class BackgroundColorSequence extends AnsiSequence {
  code = [40, 41, 42, 43, 44, 45, 46, 47, 100, 101, 102, 103, 104, 105, 106, 107];
  selector = undefined;
  
  execute(stack: TextFragment[], openAnsiState: AnsiState, sequences: number[]) : ParserResult {
    let ansi_fragment = this.last_fragment(stack);
    ansi_fragment.ansi = deepClone(ansi_fragment.ansi);
    if (ansi_fragment.content.length > 0) {
      ansi_fragment = this.new_fragment(openAnsiState);
      stack.push(ansi_fragment);
    }
    
    switch (sequences[0]) {
      case 40: // Black
        ansi_fragment.ansi.background_color = '#000';
        break;
      case 41: // Red
        ansi_fragment.ansi.background_color = '#900';
        break;
      case 42: // Green
        ansi_fragment.ansi.background_color = '#090';
        break;
      case 43: // Yellow
        ansi_fragment.ansi.background_color = '#990';
        break;
      case 44: // Blue
        ansi_fragment.ansi.background_color = '#009';
        break;
      case 45: // Magenta
        ansi_fragment.ansi.background_color = '#909';
        break;
      case 46: // Cyan
        ansi_fragment.ansi.background_color = '#099';
        break;
      case 47: // White
        ansi_fragment.ansi.background_color = 'white';
        break;
      case 100: // Black
        ansi_fragment.ansi.background_color = '#000';
        break;
      case 101: // Bright Red
        ansi_fragment.ansi.background_color = '#F00';
        break;
      case 102: // Bright Green
        ansi_fragment.ansi.background_color = '#0f0';
        break;
      case 103: // Bright Yellow
        ansi_fragment.ansi.background_color = '#ff0';
        break;
      case 104: // Bright Blue
        ansi_fragment.ansi.background_color = '#00f';
        break;
      case 105: // Bright Magenta
        ansi_fragment.ansi.background_color = '#f0f';
        break;
      case 106: // Bright Cyan
        ansi_fragment.ansi.background_color = '#0ff';
        break;
      case 107: // Bright White
        ansi_fragment.ansi.background_color = '#fff';
        break;
    }

    return {
      stack,
      openAnsiState: ansi_fragment.ansi
    };
  }  
}