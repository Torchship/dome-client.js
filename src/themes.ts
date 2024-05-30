export const DEFAULT_THEME: Theme = {
  name: 'default',
  consoleAnsi: {
    black: '#000',
    red: '#900',
    green: '#090',
    yellow: '#990',
    blue: '#009',
    magenta: '#909',
    cyan: '#099',
    white: '#fff',

    brightBlack: '#000',
    brightRed: '#f00',
    brightGreen: '#0f0',
    brightYellow: '#ff0',
    brightBlue: '#00f',
    brightMagenta: '#f0f',
    brightCyan: '#0ff',
    brightWhite: '#fff'
  }
};

export default DEFAULT_THEME;

export interface Theme {
  name: string;
  consoleAnsi: AnsiColorPalette;
}

export interface AnsiColorPalette {
  background?: string;
  foreground?: string;

  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;

  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

/*
 * MORE THEMES
 */
const AtelierDune: Theme = {
  name: 'Atelier Dune',
  consoleAnsi: {
    foreground: '#a6a28c',
    background: '#20201d',

    black: '#20201d',
    red: '#d73737',
    green: '#60ac39',
    yellow: '#cfb017',
    blue: '#6684e1',
    magenta: '#b854d4',
    cyan: '#1fad83',
    white: '#a6a28c',

    brightBlack: '#7d7a68',
    brightRed: '#f00',
    brightGreen: '#0f0',
    brightYellow: '#ff0',
    brightBlue: '#00f',
    brightMagenta: '#f0f',
    brightCyan: '#0ff',
    brightWhite: '#fefbec'
  }
}

export const THEMES: Theme[] = [
  DEFAULT_THEME,
  AtelierDune
];