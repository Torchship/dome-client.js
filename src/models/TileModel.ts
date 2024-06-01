import React from "react";
import ToolbarAction from "./ToolbarAction";
import TileComponentType from "../components/TileComponent";
import { TileManagerContextProps } from "../components/providers/TileManagerProvider";
import { SettingsContextProps } from "../components/providers/SettingsProvider";

export interface TileModel {
  title: string;
  component: TileComponentType;
  persistentData: Record<string, any>;
  getToolbarActions?: (settingsManager: React.Context<SettingsContextProps>, tileManager: React.Context<TileManagerContextProps>) => ToolbarAction[];
}