import { MosaicNode } from "react-mosaic-component";
import { ViewId } from "../components/TileComponent";
import Version from "./Version";

export const CURRENT_VERSION: Version = new Version(1, 0, 0);

export const DEFAULT_SETTINGS: Settings = {
  version: CURRENT_VERSION,
  autoscroll: true,
  autoClearInput: true,
  inputEcho: false,
  theme: 'default',
  nodeGraph: 'console',
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
  theme: string;
  output: OutputConsoleSettings;
  input: ConsoleSettings;
  nodeGraph: MosaicNode<ViewId> | null; // This is the layout of the window manager
  inputEcho: boolean;
  autoClearInput: boolean;
}

export default Settings;