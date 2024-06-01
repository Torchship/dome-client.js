import React from "react";
import ToolbarAction from "./ToolbarAction";
import TileComponentType, {TileToolbarType} from "../components/TileComponent";
import { TileManagerContextProps } from "../components/providers/TileManagerProvider";
import { SettingsContextProps } from "../components/providers/SettingsProvider";

export interface TileModel {
  title: string;
  component: TileComponentType;
  toolbar?: TileToolbarType;
  persistentData: Record<string, any>;
}