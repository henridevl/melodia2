import React, { useState, useEffect } from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ content, onChange }) => {
  const [editorState, setEditorState] = useState(() => {
    // Convertir le contenu JSON en EditorState
    const contentState = content
      ? convertFromRaw(JSON.parse(content))
      : undefined;
    return EditorState.createWithContent(contentState);
  });

  useEffect(() => {
    // Convertir l'EditorState en JSON et appeler onChange
    const rawContent = convertToRaw(editorState.getCurrentContent());
    onChange(JSON.stringify(rawContent));
  }, [editorState, onChange]);

  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };

  return (
    <div className="note-editor border p-2 rounded-md">
      <Editor
        editorState={editorState}
        onChange={handleEditorChange}
        placeholder="Write your note here..."
      />
    </div>
  );
};

export default NoteEditor;
