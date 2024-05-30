import AnsiSequence from "./AnsiSequence";
import AnsiState, { ANSI_NORMAL } from "../AnsiState";
import TextFragment from "../TextFragment";
import { deepClone } from "../../util";
import { ParserResult } from "..";

export default class TerminationSequence extends AnsiSequence {
  code = 0;
  selector = undefined;
  
  execute(stack: TextFragment[], openAnsiState: AnsiState, _sequences: number[]) : ParserResult {
    let ansi_fragment = this.last_fragment(stack);
    ansi_fragment.ansi = deepClone(ansi_fragment.ansi);
    if (ansi_fragment.content.length > 0) {
      ansi_fragment = this.new_fragment(openAnsiState);
      stack.push(ansi_fragment);
    }

    ansi_fragment.ansi = ANSI_NORMAL;

    return {
      stack,
      openAnsiState: ansi_fragment.ansi
    };
  }  
}