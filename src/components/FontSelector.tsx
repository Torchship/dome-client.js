import React, {useEffect} from 'react';
import Select from 'react-select'
import { useSettings } from './providers/SettingsProvider';

const options = [
  {label: 'Roboto Mono', value: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap'},
  {label: 'Inconsolata', value: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap'},
  {label: 'Source Code Pro', value: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap'},
  {label: 'IBM Plex Mono', value: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Inconsolata:wght@200..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap'}
]

// Function to load the font by appending a link element to the head
const loadFont = (fontUrl: string) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontUrl;
  document.head.appendChild(link);
};

export const FontSelector: React.FC = () => {
  const {settings} = useSettings();

  useEffect(() => {
    const font = options.find(f => f.label === settings.output.fontType);
    if (font) {
      loadFont(font.value);
    }
  }, [settings.output.fontType]);

  return (
    <Select 
      onChange={(e) => settings.output.fontType = e?.label}
      options={options}>

    </Select>
  );
};

export default FontSelector;