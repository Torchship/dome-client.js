import styled from 'styled-components';
import { ConsoleSettings } from '../models/Settings';

interface FontStylerProps {
  settings: ConsoleSettings;
}

export const FontStyler = styled.div<FontStylerProps>`
  font-family: ${(props: FontStylerProps) => props.settings.fontType};
  font-size: ${(props: FontStylerProps) => props.settings.fontSize}px;
`;

export default FontStyler;