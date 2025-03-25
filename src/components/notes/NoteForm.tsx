import React, { useState, useEffect } from 'react';
import { Note } from '../../services/supabase';
import Button from '../ui/Button';

interface NoteFormProps {
  note?: Note;
  onSubmit: (note: Partial<Note>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const NoteForm: React.FC<NoteFormProps> = ({
  note,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [suggestions, setSuggestions] = useState<string[]>(
    note?.suggestions || []
  );
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSuggestions(note.suggestions || []);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      content,
      suggestions,
      date: new Date().toISOString(),
    });
  };

  const toggleSuggestionMode = () => {
    setIsSuggesting((prev) => !prev);
  };

  const addSuggestion = () => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      setSuggestions([...suggestions, selectedText]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Note title"
          required
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <div className="relative">
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Write your note here..."
            required
          />
          {isSuggesting && (
            <button
              type="button"
              onClick={addSuggestion}
              className="absolute right-2 bottom-2 text-gray-500 hover:text-indigo-600"
            >
              Suggest
            </button>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700">Suggestions</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-600">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={toggleSuggestionMode}
        >
          {isSuggesting ? 'Exit Suggestion Mode' : 'Enter Suggestion Mode'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={loading}>
          {note ? 'Update Note' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
};

export default NoteForm;
