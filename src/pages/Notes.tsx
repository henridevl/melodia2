// Notes.tsx
import React, { useState, useEffect } from 'react';
import { Plus, List, Grid } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Note, Profile } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import NotesList from '../components/notes/NotesList';
import NoteForm from '../components/notes/NoteForm';
import NoteDetails from '../components/notes/NoteDetails';
import Button from '../components/ui/Button';
import Navigation from '../components/Navigation';

const Notes: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list'); // Ajoutez cet état

  useEffect(() => {
    fetchNotes();
    fetchProfile();
  }, [user]);

  const fetchNotes = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (noteData: Partial<Note>) => {
    try {
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error(
          'User profile not found. Please try logging out and back in.'
        );
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', editingNote.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{ ...noteData, user_id: user.id }]);

        if (error) throw error;
      }

      await fetchNotes();
      setShowForm(false);
      setEditingNote(null);
      setError(null);
    } catch (error) {
      console.error('Error saving note:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save note. Please try again.'
      );
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchNotes();
      setError(null);
      setSelectedNote(null);
      setShowDetails(false);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note. Please try again.');
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        signOut={signOut}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        profile={profile}
        user={user}
      />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Notes</h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => {
                setEditingNote(null);
                setShowForm(true);
                setError(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
            <button
              onClick={() =>
                setViewMode(viewMode === 'list' ? 'gallery' : 'list')
              }
              className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 flex items-center"
            >
              {viewMode === 'list' ? <List size={16} /> : <Grid size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {showForm ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            <NoteForm
              note={editingNote || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingNote(null);
                setError(null);
              }}
            />
          </div>
        ) : null}

        {showDetails && selectedNote && user && (
          <NoteDetails
            note={selectedNote}
            userId={user.id}
            onClose={() => {
              setShowDetails(false);
              setSelectedNote(null);
            }}
            onDelete={handleDelete}
          />
        )}

        <NotesList
          notes={notes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSelect={handleSelectNote}
          selectedNote={selectedNote}
          loading={loading}
          viewMode={viewMode} // Passez la prop viewMode
        />
      </div>
    </div>
  );
};

export default Notes;
