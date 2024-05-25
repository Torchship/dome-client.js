import React from 'react';
import AceEditor from 'react-ace';

import "ace-builds/src-noconflict/theme-twilight";
import "../assets/ace/mode-moo";

interface MooEditorProps {
  content: string
}

export const MooEditor: React.FC<MooEditorProps> = ({ content }) => {
  return (
    <AceEditor 
      name='ace-editor'
      value={content}
      mode="moo"
      theme="twilight"
      width="100%"
      height='auto'/>
  )
};

export default MooEditor;