export const DEFAULT_THEME: Theme = {
  name: 'default',
  consoleAnsi: {
    red: '#900',
    green: '#090',
    yellow: '#990',
    blue: '#009',
    magenta: '#909',
    cyan: '#099',
    white: '#fff',

    brightRed: '#f00',
    brightGreen: '#0f0',
    brightYellow: '#ff0',
    brightBlue: '#00f',
    brightMagenta: '#f0f',
    bringCyan: '#0ff',
    brightWhite: '#fff'
  }
};

export default DEFAULT_THEME;

export interface Theme {
  name: string;
  consoleAnsi: AnsiColorPalette;
}

export interface AnsiColorPalette {
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;

  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  bringCyan: string;
  brightWhite: string;
}

export const THEMES: Theme[] = [
  DEFAULT_THEME
];