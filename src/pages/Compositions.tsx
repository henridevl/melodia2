// Compositions.tsx
import React, { useState, useEffect } from 'react';
import { Plus, List, Grid } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Composition, Profile } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import CompositionsList from '../components/compositions/CompositionsList';
import CompositionForm from '../components/compositions/CompositionForm';
import CompositionDetails from '../components/compositions/CompositionDetails';
import Button from '../components/ui/Button';
import Navigation from '../components/Navigation';

const Compositions: React.FC = () => {
  const { user, signOut } = useAuth();
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingComposition, setEditingComposition] = useState<Composition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedComposition, setSelectedComposition] = useState<Composition | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');

  useEffect(() => {
    fetchCompositions();
    fetchProfile();
  }, [user]);

  const fetchCompositions = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('compositions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompositions(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching compositions:', error);
      setError('Failed to fetch compositions. Please try again.');
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

  const handleNotes = async (compositionId: string, notes: { id: string }[]) => {
    try {
      // Supprimer les notes existantes pour cette composition
      await supabase
        .from('composition_notes')
        .delete()
        .eq('composition_id', compositionId);
  
      // Insérer chaque note individuellement
      for (const note of notes) {
        if (!isValidUUID(note.id)) {
          throw new Error(`Invalid UUID for note: ${note.id}`);
        }
  
        const { error } = await supabase
          .from('composition_notes')
          .insert({ composition_id: compositionId, note_id: note.id });
  
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error handling notes:', error);
      throw error;
    }
  };
  
  const handleRecordings = async (compositionId: string, recordings: { id: string }[]) => {
    try {
      // Supprimer les enregistrements existants pour cette composition
      await supabase
        .from('composition_recordings')
        .delete()
        .eq('composition_id', compositionId);
  
      // Insérer chaque enregistrement individuellement
      for (const recording of recordings) {
        if (!isValidUUID(recording.id)) {
          throw new Error(`Invalid UUID for recording: ${recording.id}`);
        }
  
        const { error } = await supabase
          .from('composition_recordings')
          .insert({ composition_id: compositionId, recording_id: recording.id });
  
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error handling recordings:', error);
      throw error;
    }
  };
  
  // Fonction utilitaire pour valider les UUID
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  
  const handleSubmit = async (compositionData: Partial<Composition>) => {
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
  
      const dataToSave = {
        ...compositionData,
        user_id: user.id,
      };
  
      // Exclure les colonnes `notes` et `recordings` si elles n'existent pas
      const notes = dataToSave.notes;
      const recordings = dataToSave.recordings;
      delete dataToSave.notes;
      delete dataToSave.recordings;
  
      if (editingComposition) {
        const { error } = await supabase
          .from('compositions')
          .update(dataToSave)
          .eq('id', editingComposition.id)
          .eq('user_id', user.id);
  
        if (error) throw error;
  
        // Gérer les notes
        if (notes) {
          await handleNotes(editingComposition.id, notes);
        }
  
        // Gérer les enregistrements
        if (recordings) {
          await handleRecordings(editingComposition.id, recordings);
        }
      } else {
        const { data, error } = await supabase
          .from('compositions')
          .insert([dataToSave])
          .select('id');
  
        if (error) throw error;
  
        const newCompositionId = data[0].id;
  
        // Gérer les notes
        if (notes) {
          await handleNotes(newCompositionId, notes);
        }
  
        // Gérer les enregistrements
        if (recordings) {
          await handleRecordings(newCompositionId, recordings);
        }
      }
  
      await fetchCompositions();
      setShowForm(false);
      setEditingComposition(null);
      setError(null);
    } catch (error) {
      console.error('Error saving composition:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to save composition. Please try again.'
      );
    }
  };
  
  
  
  
  

  const handleEdit = (composition: Composition) => {
    setEditingComposition(composition);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (compositionId: string) => {
    try {
      const { error } = await supabase
        .from('compositions')
        .delete()
        .eq('id', compositionId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchCompositions();
      setError(null);
      setSelectedComposition(null);
      setShowDetails(false);
    } catch (error) {
      console.error('Error deleting composition:', error);
      setError('Failed to delete composition. Please try again.');
    }
  };

  const handleSelectComposition = (composition: Composition) => {
    setSelectedComposition(composition);
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
          <h1 className="text-2xl font-semibold text-gray-900">Compositions</h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => {
                setEditingComposition(null);
                setShowForm(true);
                setError(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Composition
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
              {editingComposition ? 'Edit Composition' : 'Create New Composition'}
            </h2>
            <CompositionForm
              composition={editingComposition || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingComposition(null);
                setError(null);
              }}
            />
          </div>
        ) : null}

        {showDetails && selectedComposition && user && (
          <CompositionDetails
            composition={selectedComposition}
            userId={user.id}
            onClose={() => {
              setShowDetails(false);
              setSelectedComposition(null);
            }}
            onDelete={handleDelete}
          />
        )}

        <CompositionsList
          compositions={compositions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSelect={handleSelectComposition}
          selectedComposition={selectedComposition}
          loading={loading}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default Compositions;
