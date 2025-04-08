import React, { useState, useEffect } from 'react';
import { Plus, List, Grid, Filter } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Composition, Profile } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import CompositionsList from '../components/compositions/CompositionsList';
import CompositionForm from '../components/compositions/CompositionForm';
import CompositionDetails from '../components/compositions/CompositionDetails';
import Button from '../components/ui/Button';
import Navigation from '../components/Navigation';
import ConfirmationDialog from '../components/ui/ConfirmationDialog'; // Assurez-vous que le chemin est correct

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
  const [filter, setFilter] = useState<'all' | 'recordings' | 'notes'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [compositionToDelete, setCompositionToDelete] = useState<string | null>(null);

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

      if (editingComposition) {
        const { error } = await supabase
          .from('compositions')
          .update(compositionData)
          .eq('id', editingComposition.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('compositions')
          .insert([{ ...compositionData, user_id: user.id }]);

        if (error) throw error;
      }

      await fetchCompositions();
      setShowForm(false);
      setEditingComposition(null);
      setError(null);
    } catch (error) {
      console.error('Error saving composition:', error);
      console.log(compositionData);
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

  const handleDelete = (compositionId: string) => {
    setCompositionToDelete(compositionId);
    setShowConfirmationDialog(true);
  };

  const confirmDelete = async () => {
    if (!compositionToDelete) return;

    try {
      const { error } = await supabase
        .from('compositions')
        .delete()
        .eq('id', compositionToDelete)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchCompositions();
      setError(null);
      setSelectedComposition(null);
      setShowDetails(false);
    } catch (error) {
      console.error('Error deleting composition:', error);
      setError('Failed to delete composition. Please try again.');
    } finally {
      setShowConfirmationDialog(false);
      setCompositionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmationDialog(false);
    setCompositionToDelete(null);
  };

  const handleSelectComposition = (composition: Composition) => {
    setSelectedComposition(composition);
    setShowDetails(true);
  };

  const filteredCompositions = () => {
    let items = compositions;

    // Apply search
    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    items = items.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return items;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${showForm || showDetails ? 'modal-open' : ''}`}>
      <Navigation
        signOut={signOut}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        profile={profile}
        user={user}
      />
      {!showDetails && !showForm && (
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

          <div className="flex justify-between items-center mb-4">
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
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Search compositions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1"
            />
          </div>

          <CompositionsList
            compositions={filteredCompositions()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={handleSelectComposition}
            selectedComposition={selectedComposition}
            loading={loading}
            viewMode={viewMode}
          />
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
            onClose={() => {
              setShowForm(false);

            }}
            onCancel={() => {
              setShowForm(false);
              setEditingComposition(null);
              setError(null);
            }}
          />
        </div>
      ) : null}

      {showDetails && selectedComposition && user && (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <CompositionDetails
            composition={selectedComposition}
            userId={user.id}
            onClose={() => {
              setShowDetails(false);
              setSelectedComposition(null);
            }}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      )}

      <ConfirmationDialog
        isOpen={showConfirmationDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Are you sure you want to delete this composition?"
      />
    </div>
  );
};

export default Compositions;
