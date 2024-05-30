import AnsiState from "./AnsiState";

export default interface TextFragment {
  content: string;
  ansi: AnsiState;
}