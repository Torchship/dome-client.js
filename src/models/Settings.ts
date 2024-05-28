import Version from "./Version";

export const CURRENT_VERSION: Version = new Version(1, 0, 0);

export const DEFAULT_SETTINGS: Settings = {
  version: CURRENT_VERSION,
  autoscroll: true,
  autoClearInput: true,
  inputEcho: false,
  input: {
    fontType: "Source Code Pro",
    fontSize: 14,
  },
  output: {
    fontType: "Source Code Pro",
    fontSize: 14,
    lineWidth: 78
  }
}

export interface ConsoleSettings {
  fontType: string;
  fontSize: number;
  
}

export interface OutputConsoleSettings extends ConsoleSettings {
  lineWidth: number;
}

export interface Settings {
  version: Version;
  autoscroll: boolean;
  output: OutputConsoleSettings;
  input: ConsoleSettings;
  inputEcho: boolean;
  autoClearInput: boolean;
}

export default Settings;