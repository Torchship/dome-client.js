import AnsiSequence from "./AnsiSequence";
import AnsiState from "../AnsiState";
import TextFragment from "../TextFragment";
import { deepClone } from "../../util";
import { ParserResult } from "..";
import { Theme } from "../../themes";

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
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.black;
        break;
      case 41: // Red
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.red;
        break;
      case 42: // Green
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.green;
        break;
      case 43: // Yellow
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.yellow;
        break;
      case 44: // Blue
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.blue;
        break;
      case 45: // Magenta
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.magenta;
        break;
      case 46: // Cyan
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.cyan;
        break;
      case 47: // White
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.white;
        break;
      case 100: // Black
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.brightBlack;
        break;
      case 101: // Bright Red
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.brightRed;
        break;
      case 102: // Bright Green
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.brightGreen;
        break;
      case 103: // Bright Yellow
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.brightYellow;
        break;
      case 104: // Bright Blue
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.brightBlue;
        break;
      case 105: // Bright Magenta
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.brightMagenta;
        break;
      case 106: // Bright Cyan
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.brightCyan;
        break;
      case 107: // Bright White
        ansi_fragment.ansi.background_color = (theme: Theme) => theme.consoleAnsi.brightWhite;
        break;
    }

    return {
      stack,
      openAnsiState: ansi_fragment.ansi
    };
  }  
}