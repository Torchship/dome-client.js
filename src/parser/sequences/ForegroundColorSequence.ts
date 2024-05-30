import AnsiSequence from "./AnsiSequence";
import AnsiState from "../AnsiState";
import TextFragment from "../TextFragment";
import { deepClone } from "../../util";
import { ParserResult } from "..";
import { Theme } from "../../themes";

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
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.black;
        break;
      case 31: // Red
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.red;
        break;
      case 32: // Green
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.green;
        break;
      case 33: // Yellow
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.yellow;
        break;
      case 34: // Blue
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.blue;
        break;
      case 35: // Magenta
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.magenta;
        break;
      case 36: // Cyan
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.cyan;
        break;
      case 37: // White
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.white;
        break;
      case 90: // Black
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.brightBlack;
        break;
      case 91: // Bright Red
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.brightRed;
        break;
      case 92: // Bright Green
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.brightGreen;
        break;
      case 93: // Bright Yellow
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.brightYellow;
        break;
      case 94: // Bright Blue
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.brightBlue;
        break;
      case 95: // Bright Magenta
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.brightMagenta;
        break;
      case 96: // Bright Cyan
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.brightCyan;
        break;
      case 97: // Bright White
        ansi_fragment.ansi.foreground_color = (theme: Theme) => theme.consoleAnsi.brightWhite;
        break;
    }

    return {
      stack,
      openAnsiState: ansi_fragment.ansi
    };
  }  
}