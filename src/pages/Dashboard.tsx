import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Music, BookOpen, Clock, Plus } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import NoteDetails from '../components/notes/NoteDetails'; // Import the NoteDetails component
import RecordingDetails from '../components/recordings/RecordingDetails'; // Import the RecordingDetails component
import NoteForm from '../components/notes/NoteForm'; // Import the NoteForm component
import RecordingForm from '../components/recordings/RecordingForm'; // Import the RecordingForm component
import { supabase } from '../services/supabase';
import type { Profile, Note, Recording } from '../services/supabase';
import Navigation from '../components/Navigation'; // Import the Navigation component

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordingsCount, setRecordingsCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [practiceTime, setPracticeTime] = useState(0);
  const [activities, setActivities] = useState([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showRecordingForm, setShowRecordingForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    const fetchRecordingsCount = async () => {
      if (!user) return;

      try {
        const { count, error } = await supabase
          .from('recordings')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        if (error) throw error;
        setRecordingsCount(count || 0);
      } catch (error) {
        console.error('Error fetching recordings count:', error);
      }
    };

    const fetchNotesCount = async () => {
      if (!user) return;

      try {
        const { count, error } = await supabase
          .from('notes')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        if (error) throw error;
        setNotesCount(count || 0);
      } catch (error) {
        console.error('Error fetching notes count:', error);
      }
    };

    const fetchPracticeTime = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('practice_time')
          .select('total_time')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setPracticeTime(data?.total_time || 0);
      } catch (error) {
        console.error('Error fetching practice time:', error);
      }
    };

    const fetchRecentActivities = async () => {
      if (!user) return;

      try {
        const { data: recordings, error: recordingsError } = await supabase
          .from('recordings')
          .select('id, title, created_at, audio_url')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recordingsError) throw recordingsError;

        const { data: notes, error: notesError } = await supabase
          .from('notes')
          .select('id, title, content, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (notesError) throw notesError;

        const combinedActivities = [
          ...recordings.map((recording) => ({
            id: recording.id,
            activity_type: 'New Recording',
            description: recording.title,
            created_at: recording.created_at,
            audio_url: recording.audio_url,
          })),
          ...notes.map((note) => ({
            id: note.id,
            activity_type: 'Note Added',
            description: note.content,
            created_at: note.created_at,
            title: note.title,
            content: note.content,
          })),
        ];

        // Trier les activités combinées par date
        combinedActivities.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setActivities(combinedActivities.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    fetchProfile();
    fetchRecordingsCount();
    fetchNotesCount();
    fetchPracticeTime();
    fetchRecentActivities();
  }, [user]);

  const handleActivityClick = (activity: any) => {
    if (activity.activity_type === 'Note Added') {
      setSelectedNote(activity);
    } else if (activity.activity_type === 'New Recording') {
      setSelectedRecording(activity);
    }
  };

  const handleCloseNoteDetails = () => {
    setSelectedNote(null);
  };

  const handleCloseRecordingDetails = () => {
    setSelectedRecording(null);
  };

  const handleNewNote = () => {
    setShowNoteForm(true);
  };

  const handleNewRecording = () => {
    setShowRecordingForm(true);
  };

  const handleNoteFormSubmit = async (note: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...note, user_id: user?.id }]);

      if (error) throw error;
      setShowNoteForm(false);
      await fetchRecentActivities();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleNoteFormCancel = () => {
    setShowNoteForm(false);
  };

  const handleRecordingFormSave = async () => {
    setShowRecordingForm(false);
    await fetchRecentActivities();
  };

  const handleRecordingFormClose = () => {
    setShowRecordingForm(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bonjour';
    return 'Bonsoir';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Navigation
      signOut={signOut}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      isNavOpen={isNavOpen}
      setIsNavOpen={setIsNavOpen}
      profile={profile}
      user={user}
      notifications={notifications}
      notificationCount={notificationCount}
    >
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {getGreeting()}, {profile?.first_name || 'there'}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Voici un aperçu de votre travail !
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onClick={handleNewNote}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </button>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onClick={handleNewRecording}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Recording
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Recordings"
              value={recordingsCount}
              icon={Music}
              loading={loading}
            />
            <StatsCard
              title="Notes"
              value={notesCount}
              icon={BookOpen}
              loading={loading}
            />
            <StatsCard
              title="Practice Time"
              value={`${practiceTime}h`}
              icon={Clock}
              loading={loading}
            />
          </div>

          <div className="mt-8">
            <ActivityFeed
              activities={activities}
              onActivityClick={handleActivityClick}
            />
          </div>
        </div>
      </main>

      {selectedNote && (
        <NoteDetails
          note={selectedNote}
          userId={user?.id || ''}
          onClose={handleCloseNoteDetails}
        />
      )}

      {selectedRecording && (
        <RecordingDetails
          recording={selectedRecording}
          userId={user?.id || ''}
          onClose={handleCloseRecordingDetails}
        />
      )}

      {showNoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <NoteForm
              onSubmit={handleNoteFormSubmit}
              onCancel={handleNoteFormCancel}
              loading={loading}
            />
          </div>
        </div>
      )}

      {showRecordingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <RecordingForm
            onSave={handleRecordingFormSave}
            onClose={handleRecordingFormClose}
          />
        </div>
      )}
    </Navigation>
  );
};

export default Dashboard;
