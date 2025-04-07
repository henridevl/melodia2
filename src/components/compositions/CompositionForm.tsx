import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import type { Composition, Recording, Note } from '../../services/supabase';
import Button from '../ui/Button';
import { Plus, X, Music, FileText, Calendar, Clock, Tag, Filter, Trash } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AudioPlayer from '../recordings/AudioPlayer';

interface CompositionFormProps {
  composition?: Composition;
  onSubmit: (compositionData: Partial<Composition>) => void;
  onCancel: () => void;
}

const useSelector = (initialItems: any[], fetchItems: () => Promise<any[]>) => {
  const [selectedItems, setSelectedItems] = useState<any[]>(initialItems);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      const items = await fetchItems();
      setAvailableItems(items);
    };
    loadItems();
  }, [fetchItems]);

  const addItem = (item: any) => {
    setSelectedItems((prevItems) => [...prevItems, item]);
  };

  const removeItem = (itemId: string) => {
    setSelectedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter((item) => !selectedItems.find((si) => si.id === item.id));
  }, [availableItems, selectedItems]);

  return {
    selectedItems,
    availableItems: filteredAvailableItems,
    showSelector,
    setShowSelector,
    addItem,
    removeItem,
  };
};

const CompositionForm: React.FC<CompositionFormProps> = ({
  composition,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState<string>(composition?.title || '');
  const [description, setDescription] = useState<string>(composition?.description || '');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    selectedItems: selectedRecordings,
    availableItems: availableRecordings,
    showSelector: showRecordingSelector,
    setShowSelector: setShowRecordingSelector,
    addItem: addRecording,
    removeItem: removeRecording,
  } = useSelector(composition?.recordings || [], async () => {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });
    return error ? [] : data;
  });

  const {
    selectedItems: selectedNotes,
    availableItems: availableNotes,
    showSelector: showNoteSelector,
    setShowSelector: setShowNoteSelector,
    addItem: addNote,
    removeItem: removeNote,
  } = useSelector(composition?.notes || [], async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    return error ? [] : data;
  });

  useEffect(() => {
    if (composition) {
      fetchAssociatedContent();
    } else {
      setLoading(false);
    }
  }, [composition]);

  const fetchAssociatedContent = async () => {
    try {
      // Fetch associated recordings
      const { data: recordingData, error: recordingError } = await supabase
        .from('composition_recordings')
        .select(`
          recordings (*)
        `)
        .eq('composition_id', composition.id);

      if (recordingError) throw recordingError;
      setRecordings(recordingData?.map(r => r.recordings) || []);

      // Fetch associated notes
      const { data: noteData, error: noteError } = await supabase
        .from('composition_notes')
        .select(`
          notes (*)
        `)
        .eq('composition_id', composition.id);

      if (noteError) throw noteError;
      setNotes(noteData?.map(n => n.notes) || []);
    } catch (error) {
      console.error('Error fetching associated content:', error);
    } finally {
      setLoading(false);
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

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  const handleAddNote = async () => {
    const newNote = {
      title: 'New Note',
      content: 'This is a new note.',
      created_at: new Date().toISOString(),
      composition_id: composition.id,
    };

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select('*');

      if (error) throw error;

      setNotes([...notes, data[0]]);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleAddRecording = async () => {
    const newRecording = {
      title: 'New Recording',
      audio_url: 'https://example.com/audio.mp3',
      created_at: new Date().toISOString(),
      composition_id: composition.id,
    };

    try {
      const { data, error } = await supabase
        .from('recordings')
        .insert([newRecording])
        .select('*');

      if (error) throw error;

      setRecordings([...recordings, data[0]]);
    } catch (error) {
      console.error('Error adding recording:', error);
    }
  };

  const handleDeleteRecording = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId);

      if (error) throw error;

      setRecordings(recordings.filter(recording => recording.id !== recordingId));
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
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
        <ReactQuill
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Recordings Section */}
      <SelectorSection
        label="Recordings"
        selectedItems={selectedRecordings}
        availableItems={availableRecordings}
        showSelector={showRecordingSelector}
        setShowSelector={setShowRecordingSelector}
        addItem={addRecording}
        removeItem={removeRecording}
      />

      {/* Notes Section */}
      <SelectorSection
        label="Notes"
        selectedItems={selectedNotes}
        availableItems={availableNotes}
        showSelector={showNoteSelector}
        setShowSelector={setShowNoteSelector}
        addItem={addNote}
        removeItem={removeNote}
      />

      {/* Associated Recordings and Notes */}
      <div className="space-y-6 ">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Music className="h-5 w-5 text-indigo-500 mr-2" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {recording.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(recording.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(recording.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteRecording(recording.id)}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-4">
                  <AudioPlayer
                    audioUrl={recording.audio_url}
                    resourceId={recording.id}
                    resourceType="recording"
                  />
                </div>
              </div>
            ))}

            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(note.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteNote(note.id)}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-4 prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pb-10">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {composition ? 'Update Composition' : 'Create Composition'}
        </Button>
      </div>
    </form>
  );
};

interface SelectorSectionProps {
  label: string;
  selectedItems: any[];
  availableItems: any[];
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  addItem: (item: any) => void;
  removeItem: (itemId: string) => void;
}

const SelectorSection: React.FC<SelectorSectionProps> = ({
  label,
  selectedItems,
  availableItems,
  showSelector,
  setShowSelector,
  addItem,
  removeItem,
}) => (
  <div>
    <div className="flex justify-between items-center mb-2 ">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Button
        type="button"
        onClick={() => setShowSelector(true)}
        variant="secondary"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add {label.slice(0, -1)}
      </Button>
    </div>
    <div className="space-y-2">
      {selectedItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
        >
          <span className="text-sm text-gray-700">{item.title}</span>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
    {showSelector && (
      <div className="mt-2 p-4 border rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Select {label.slice(0, -1)}</h4>
          <button
            type="button"
            onClick={() => setShowSelector(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addItem(item)}
              className="w-full text-left p-2 hover:bg-gray-50 rounded-md"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default CompositionForm;
