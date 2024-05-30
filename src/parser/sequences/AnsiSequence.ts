import { ParserResult } from "..";
import { deepClone } from "../../util";
import AnsiState from "../AnsiState";
import TextFragment from "../TextFragment";

export default abstract class AnsiSequence {
  /*
   * This is the code immediately proceeding the ] command.
  */
  abstract code: number | number[];
  
  /*
   * If the code has a semi-colon, this is the first number proceeding the code
   * Optional; if not provided the match is greedy and will be passed to execute.
   */
  abstract selector?: number; 

  last_fragment(stack: TextFragment[]): TextFragment {
    return stack[stack.length - 1];
  };

  new_fragment(openAnsiState: AnsiState): TextFragment {
    return {
      content: '',
      ansi: deepClone(openAnsiState)
    };
  };

  abstract execute(stack: TextFragment[], openAnsiState: AnsiState, sequences: number[]): ParserResult;
}