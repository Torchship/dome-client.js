import React, { createContext, useContext, ReactNode, useState } from 'react';
import MooEditor from '../MooEditor';
import NewWindow from 'react-new-window';

import "./EditorManagerProvider.css";
import Button from '../Button';

interface EditorWindowData {
  id: string,
  title: string,
  content: string
}

interface EditorManagerContextProps {
  editors: EditorWindowData[],
  spawnEditor?: (type: string, content: string, params: Record<string, string>) => EditorWindowData;
}

const EditorManagerContext = createContext<EditorManagerContextProps>({editors: [], spawnEditor: undefined});

export const useEditorManager = () => useContext(EditorManagerContext);

interface EditorManagerProps {
  children: ReactNode;
}

export const EditorManagerProvider: React.FC<EditorManagerProps> = ({ children }) => {
  const [editorWindows, setEditorWindows] = useState<EditorWindowData[]>([]);

  const spawnEditor = (type: string, content: string, params: Record<string, string>): EditorWindowData => {
    const newEditor: EditorWindowData = {
      id: `${type}-${Date.now()}`,
      title: 'Scratch',
      content
    };

    if (type === 'edit' && 'name' in params) {
      newEditor.title = `Editing ${params['name']}`;
    }

    setEditorWindows([...editorWindows, newEditor]);
    return newEditor;
  };

  const onEditorUnload = (editor: EditorWindowData) => {
    setEditorWindows(editorWindows.filter(other => other.id !== editor.id));
  };

  return (
    <EditorManagerContext.Provider value={{editors: editorWindows, spawnEditor}}>
      {editorWindows.map(data => (
        <NewWindow 
          key={data.id}
          title={data.title}
          onUnload={() => onEditorUnload(data)}
          onBlock={() => onEditorUnload(data)}>
            <div className="editor-container">
              <div className="header">
                <Button label="Abort"></Button>
                <Button label="Save"></Button>
              </div>
              <div className="content">
                <MooEditor content={data.content} />
              </div>
            </div>            
        </NewWindow>
      ))}
      {children}
    </EditorManagerContext.Provider>
  );
};
