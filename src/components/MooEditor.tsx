import React from 'react';
import AceEditor from 'react-ace';

import "ace-builds/src-noconflict/theme-twilight";
import "../assets/ace/mode-moo";

interface MooEditorProps {
  content: string;
  onChange?: ((value: string, event?: any) => void) | undefined;
}

export const MooEditor: React.FC<MooEditorProps> = ({ content, onChange }) => {
  return (
    <AceEditor 
      name='ace-editor'
      value={content}
      mode="moo"
      theme="twilight"
      width="100%"
      height='auto'
      onChange={onChange}/>
  )
};

export default MooEditor;