export const ANSI_NORMAL: AnsiState = {
  is_underline: false,
  is_italic: false,
  blink: 'none',
  weight: 'normal',
  foreground_color: 'normal',
  background_color: 'normal'
};

export default interface AnsiState {
  is_underline: boolean;
  is_italic: boolean;
  blink: 'none' | 'slow' | 'rapid';
  weight: 'normal' | 'faint',
  foreground_color: string;
  background_color: string;
}