import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Composition, Recording, Note } from '../../services/supabase';
import Button from '../ui/Button';
import { Plus, X } from 'lucide-react';

interface CompositionFormProps {
  composition?: Composition;
  onSubmit: (compositionData: Partial<Composition>) => void;
  onCancel: () => void;
}

const CompositionForm: React.FC<CompositionFormProps> = ({
  composition,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState<string>(composition?.title || '');
  const [description, setDescription] = useState<string>(composition?.description || '');
  const [selectedRecordings, setSelectedRecordings] = useState<Recording[]>(composition?.recordings || []);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>(composition?.notes || []);
  const [availableRecordings, setAvailableRecordings] = useState<Recording[]>([]);
  const [availableNotes, setAvailableNotes] = useState<Note[]>([]);
  const [showRecordingSelector, setShowRecordingSelector] = useState(false);
  const [showNoteSelector, setShowNoteSelector] = useState(false);

  useEffect(() => {
    fetchAvailableRecordings();
    fetchAvailableNotes();
  }, []);

  const fetchAvailableRecordings = async () => {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAvailableRecordings(data);
    }
  };

  const fetchAvailableNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAvailableNotes(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const compositionData = {
      title,
      description,
      recordings: selectedRecordings,
      notes: selectedNotes,
    };
    onSubmit(compositionData);
  };

  const addRecording = (recording: Recording) => {
    setSelectedRecordings([...selectedRecordings, recording]);
    setShowRecordingSelector(false);
  };

  const removeRecording = (recordingId: string) => {
    setSelectedRecordings(selectedRecordings.filter(r => r.id !== recordingId));
  };

  const addNote = (note: Note) => {
    setSelectedNotes([...selectedNotes, note]);
    setShowNoteSelector(false);
  };

  const removeNote = (noteId: string) => {
    setSelectedNotes(selectedNotes.filter(n => n.id !== noteId));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={4}
        />
      </div>

      {/* Recordings Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Recordings</label>
          <Button
            type="button"
            onClick={() => setShowRecordingSelector(true)}
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Recording
          </Button>
        </div>
        <div className="space-y-2">
          {selectedRecordings.map((recording) => (
            <div
              key={recording.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
            >
              <span className="text-sm text-gray-700">{recording.title}</span>
              <button
                type="button"
                onClick={() => removeRecording(recording.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {showRecordingSelector && (
          <div className="mt-2 p-4 border rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Select Recording</h4>
              <button
                type="button"
                onClick={() => setShowRecordingSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableRecordings
                .filter(r => !selectedRecordings.find(sr => sr.id === r.id))
                .map((recording) => (
                  <button
                    key={recording.id}
                    type="button"
                    onClick={() => addRecording(recording)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-md"
                  >
                    {recording.title}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <Button
            type="button"
            onClick={() => setShowNoteSelector(true)}
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        </div>
        <div className="space-y-2">
          {selectedNotes.map((note) => (
            <div
              key={note.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
            >
              <span className="text-sm text-gray-700">{note.title}</span>
              <button
                type="button"
                onClick={() => removeNote(note.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {showNoteSelector && (
          <div className="mt-2 p-4 border rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Select Note</h4>
              <button
                type="button"
                onClick={() => setShowNoteSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableNotes
                .filter(n => !selectedNotes.find(sn => sn.id === n.id))
                .map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => addNote(note)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-md"
                  >
                    {note.title}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {composition ? 'Update Composition' : 'Create Composition'}
        </Button>
      </div>
    </form>
  );
}

export default CompositionForm;