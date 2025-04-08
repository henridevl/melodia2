// Main CompositionForm Component
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Composition, Recording, Note, Feedback } from '../../services/supabase';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Button from '../ui/Button';
import FormHeader from './FormHeader';
import CompositionViewer from './CompositionViewer';
import CompositionEditor from './CompositionEditor';

interface CompositionFormProps {
  composition?: Composition;
  userId: string;
  onSubmit: (compositionData: Partial<Composition>) => void;
  onDelete: (compositionId: string) => void;
  onClose: () => void;
  loading?: boolean;
}

const CompositionForm: React.FC<CompositionFormProps> = ({
  composition,
  userId,
  onSubmit,
  onDelete,
  onClose,
  loading = false,
}) => {
  const [isEditMode, setIsEditMode] = useState(!composition);
  const [title, setTitle] = useState(composition?.title || '');
  const [description, setDescription] = useState(composition?.description || '');
  const [tags, setTags] = useState<string[]>(composition?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

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

    const errors: { title?: string; description?: string } = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    if (!description.trim()) {
      errors.description = 'Description is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const compositionData = {
      title: title.trim(),
      description: description.trim(),
      recordings: selectedRecordings,
      notes: selectedNotes,
      updated_at: new Date().toISOString()
    };

    await onSubmit(compositionData);
    setIsEditMode(false);
  };

  const handleTagAdd = (newTag: string) => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
    }
    setTagInput('');
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleTagAdd(tagInput);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (validationErrors.title) {
      setValidationErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const addRecording = async (recording: Recording) => {
    const updatedRecordings = [...selectedRecordings, recording];
    setSelectedRecordings(updatedRecordings);
    setShowRecordingSelector(false);

    // Ajouter une entrée dans la table de jonction composition_recordings
    const { error } = await supabase
      .from('composition_recordings')
      .insert([{ composition_id: composition!.id, recording_id: recording.id }]);

    if (error) {
      console.error('Error adding recording:', error);
    }
  };

  const removeRecording = async (recordingId: string) => {
    const updatedRecordings = selectedRecordings.filter(r => r.id !== recordingId);
    setSelectedRecordings(updatedRecordings);

    // Supprimer l'entrée correspondante dans la table de jonction composition_recordings
    const { error } = await supabase
      .from('composition_recordings')
      .delete()
      .eq('composition_id', composition!.id)
      .eq('recording_id', recordingId);

    if (error) {
      console.error('Error removing recording:', error);
    }
  };

  const addNote = async (note: Note) => {
    const updatedNotes = [...selectedNotes, note];
    setSelectedNotes(updatedNotes);
    setShowNoteSelector(false);

    // Ajouter une entrée dans la table de jonction composition_notes
    const { error } = await supabase
      .from('composition_notes')
      .insert([{ composition_id: composition!.id, note_id: note.id }]);

    if (error) {
      console.error('Error adding note:', error);
    }
  };

  const removeNote = async (noteId: string) => {
    const updatedNotes = selectedNotes.filter(n => n.id !== noteId);
    setSelectedNotes(updatedNotes);

    // Supprimer l'entrée correspondante dans la table de jonction composition_notes
    const { error } = await supabase
      .from('composition_notes')
      .delete()
      .eq('composition_id', composition!.id)
      .eq('note_id', noteId);

    if (error) {
      console.error('Error removing note:', error);
    }
  };

  const updateComposition = async (data: Partial<Composition>) => {
    const compositionData = {
      ...composition,
      ...data,
      updated_at: new Date().toISOString()
    };

    await onSubmit(compositionData);
  };

  if (isEditMode) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <FormHeader
          isEditMode={true}
          onClose={() => composition ? setIsEditMode(false) : onClose()}
          onSubmit={handleSubmit}
          loading={loading}
          isExisting={!!composition}
        />

        <CompositionEditor
          title={title}
          description={description}
          tags={tags}
          tagInput={tagInput}
          validationErrors={validationErrors}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onTagInputChange={(e) => setTagInput(e.target.value)}
          onTagAdd={handleAddTag}
          onTagRemove={removeTag}
        />

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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
      <FormHeader
        isEditMode={false}
        onClose={onClose}
        onEdit={() => setIsEditMode(true)}
        onDelete={() => onDelete(composition!.id)}
      />

      <CompositionViewer
        title={title}
        description={description}
        tags={tags}
        compositionId={composition?.id}
        userId={userId}
      />

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
    </div>
  );
};

export default CompositionForm;
