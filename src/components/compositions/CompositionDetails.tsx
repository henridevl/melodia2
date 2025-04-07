import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Composition, Recording, Note } from '../../services/supabase';
import Button from '../ui/Button';
import {  X, Music, FileText, Calendar, Clock, Tag, Filter, Pencil, Plus, Trash, ArrowLeft } from 'lucide-react';
import AudioPlayer from '../recordings/AudioPlayer';

interface CompositionDetailsProps {
  composition: Composition;
  userId: string;
  onClose: () => void;
  onDelete: (compositionId: string) => void;
  onEdit: (composition: Composition) => void;
}

const CompositionDetails: React.FC<CompositionDetailsProps> = ({
  composition,
  userId,
  onClose,
  onDelete,
  onEdit,
}) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recordings' | 'notes'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'status'>('date');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssociatedContent();
  }, [composition.id]);

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

  const filteredContent = () => {
    let items = [];
    if (filter === 'all' || filter === 'recordings') {
      items = [...recordings.map(r => ({ ...r, type: 'recording' }))];
    }
    if (filter === 'all' || filter === 'notes') {
      items = [...items, ...notes.map(n => ({ ...n, type: 'note' }))];
    }

    // Apply search
    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ('content' in item && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    return items.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'status':
          return (b.status || 'draft').localeCompare(a.status || 'draft');
        default:
          return 0;
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="secondary" onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {composition.title}
              </h2>
              <p className="text-gray-600 mt-1">{composition.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => onEdit(composition)}
                className="bg-indigo-600 text-black hover:bg-indigo-700"
              >
                <Pencil className="h-5 w-5" />
              </Button>
              
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button onClick={handleAddNote} className="bg-green-500 text-white hover:bg-green-600">
                <Plus className="h-5 w-5 mr-2" />
                Add Note
              </Button>
              <Button onClick={handleAddRecording} className="bg-blue-500 text-white hover:bg-blue-600">
                <Plus className="h-5 w-5 mr-2" />
                Add Recording
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'recordings' | 'notes')}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All</option>
                <option value="recordings">Recordings</option>
                <option value="notes">Notes</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'type' | 'status')}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="date">Date</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading content...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredContent().map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {item.type === 'recording' ? (
                          <Music className="h-5 w-5 text-indigo-500 mr-2" />
                        ) : (
                          <FileText className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(item.created_at).toLocaleTimeString()}
                            </span>
                            <span className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              {item.status || 'Draft'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          item.type === 'recording'
                            ? handleDeleteRecording(item.id)
                            : handleDeleteNote(item.id)
                        }
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>

                    {item.type === 'recording' && 'audio_url' in item && (
                      <div className="mt-4">
                        <AudioPlayer
                          audioUrl={item.audio_url}
                          resourceId={item.id}
                          resourceType="recording"
                        />
                      </div>
                    )}

                    {item.type === 'note' && 'content' in item && (
                      <div className="mt-4 prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {item.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => onDelete(composition.id)}
                color="red"
              >
                <Trash className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompositionDetails;
