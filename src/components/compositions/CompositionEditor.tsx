// components/form/CompositionEditor.tsx
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Plus } from 'lucide-react';
import Button from '../ui/Button';
import TagInput from './TagInput';
//import RecordingSelector from './RecordingSelector';
//import NoteSelector from './NoteSelector';

interface CompositionEditorProps {
  title: string;
  description: string;
  tags: string[];
  tagInput: string;
  validationErrors: {
    title?: string;
    description?: string;
  };
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (value: string) => void;
  onTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagAdd: (e: React.KeyboardEvent) => void;
  onTagRemove: (tag: string) => void;
  //recordingSelector: any;
  //noteSelector: any;
}

const CompositionEditor: React.FC<CompositionEditorProps> = ({
  title,
  description,
  tags,
  tagInput,
  validationErrors,
  onTitleChange,
  onDescriptionChange,
  onTagInputChange,
  onTagAdd,
  onTagRemove,
  //recordingSelector,
  //noteSelector
}) => {
  return (
    <form className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={onTitleChange}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            ${validationErrors.title ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="Enter composition title"
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <ReactQuill
          value={description}
          onChange={onDescriptionChange}
          className={`mt-1 block w-full rounded-md ${validationErrors.description ? 'border-red-300' : ''}`}
          theme="snow"
          modules={{
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['clean']
            ],
          }}
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
        )}
      </div>
{/* 
      <TagInput 
        tags={tags} 
        tagInput={tagInput}
        onTagInputChange={onTagInputChange}
        onTagAdd={onTagAdd}
        onTagRemove={onTagRemove}
      />

      <div className="space-y-6">
        <RecordingSelector 
          selectedRecordings={recordingSelector.selectedItems}
          availableRecordings={recordingSelector.availableItems}
          showSelector={recordingSelector.showSelector}
          setShowSelector={recordingSelector.setShowSelector}
          searchTerm={recordingSelector.searchTerm}
          setSearchTerm={recordingSelector.setSearchTerm}
          addRecording={recordingSelector.addItem}
          removeRecording={recordingSelector.removeItem}
        />

        <NoteSelector 
          selectedNotes={noteSelector.selectedItems}
          availableNotes={noteSelector.availableItems}
          showSelector={noteSelector.showSelector}
          setShowSelector={noteSelector.setShowSelector}
          searchTerm={noteSelector.searchTerm}
          setSearchTerm={noteSelector.setSearchTerm}
          addNote={noteSelector.addItem}
          removeNote={noteSelector.removeItem}
        />
      </div>
      */}
    </form>
  );
};

export default CompositionEditor;
