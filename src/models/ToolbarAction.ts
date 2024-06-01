import Settings from "./Settings";

export interface ToolbarAction {
  onClick: (setSettings: (newSettings: Settings) => void) => void;
  icon?: string;
  style?: React.CSSProperties;
  text?: string;
  color?: "info" | "success" | "error" | "warning";
}

export default ToolbarAction;