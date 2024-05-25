import React, { createContext, useContext, ReactNode, useState } from 'react';
import MooEditor from '../MooEditor';
import NewWindow from 'react-new-window';

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
      title: params['name'] || 'Scratch',
      content
    };

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
          name={data.title}
          onUnload={() => onEditorUnload(data)}
          onBlock={() => onEditorUnload(data)}>
            <MooEditor content={data.content} />
        </NewWindow>
      ))}
      {children}
    </EditorManagerContext.Provider>
  );
};
