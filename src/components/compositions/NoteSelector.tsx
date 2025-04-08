// components/form/NoteSelector.tsx
import React from 'react';
import { FileText, Plus, Trash, X } from 'lucide-react';
import Button from '../ui/Button';

interface NoteSelectorProps {
  selectedNotes: any[];
  availableNotes: any[];
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addNote: (note: any) => void;
  removeNote: (noteId: string) => void;
}

const NoteSelector: React.FC<NoteSelectorProps> = ({
  selectedNotes,
  availableNotes,
  showSelector,
  setShowSelector,
  searchTerm,
  setSearchTerm,
  addNote,
  removeNote
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <Button
          type="button"
          onClick={() => setShowSelector(true)}
          variant="secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="space-y-2">
        {selectedNotes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {note.content.length > 100
                      ? `${note.content.substring(0, 100)}...`
                      : note.content}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeNote(note.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showSelector && (
        <div className="mt-4 p-4 border rounded-md bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Select Notes</h4>
            <button
              type="button"
              onClick={() => setShowSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4 p-2 border rounded-md"
          />
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => addNote(note)}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-md flex items-center space-x-3"
              >
                <FileText className="h-4 w-4 text-green-500" />
                <span>{note.title}</span>
              </button>
            ))}
            {availableNotes.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No notes available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteSelector;
