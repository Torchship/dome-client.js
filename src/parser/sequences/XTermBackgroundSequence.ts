import AnsiSequence from "./AnsiSequence";
import AnsiState from "../AnsiState";
import TextFragment from "../TextFragment";
import { deepClone } from "../../util";
import { ParserResult } from "..";

export default class XTermBackgroundSequence extends AnsiSequence {
  code = 48;
  selector = 5;
  
  execute(stack: TextFragment[], openAnsiState: AnsiState, sequences: number[]) : ParserResult {
    let ansi_fragment = this.last_fragment(stack);
    ansi_fragment.ansi = deepClone(ansi_fragment.ansi);
    if (ansi_fragment.content.length > 0) {
      ansi_fragment = this.new_fragment(openAnsiState);
      stack.push(ansi_fragment);
    }
    
    const xtermCode = sequences[2];
    const index = xtermCode - 16;
    const r = Math.floor(index / 36) % 6 * 51;
    const g = Math.floor(index / 6) % 6 * 51;
    const b = index % 6 * 51;
    ansi_fragment.ansi.background_color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

    return {
      stack,
      openAnsiState: ansi_fragment.ansi
    };
  }  
}