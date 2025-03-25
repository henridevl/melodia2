import React, { useState, useEffect } from 'react';
import { Mic, Upload } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Recording, Profile } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import RecordingList from '../components/recordings/RecordingList';
import RecordingForm from '../components/recordings/RecordingForm';
import RecordingDetails from '../components/recordings/RecordingDetails';
import SharePopup from '../components/ui/SharePopup';
import Button from '../components/ui/Button';
import Navigation from '../components/Navigation';
import ErrorMessage from '../components/ui/ErrorMessage';
import AudioUploadForm from '../components/recordings/AudioUploadForm';

const Recordings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecordings();
      fetchProfile();
    }
  }, [user]);

  const fetchRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError('Failed to fetch recordings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleDelete = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchRecordings();
      setSelectedRecording(null);
      setShowDetails(false);
      setError(null);
    } catch (error) {
      console.error('Error deleting recording:', error);
      setError('Failed to delete recording. Please try again.');
    }
  };

  const handleShare = (recording: Recording) => {
    setSelectedRecording(recording);
    setIsSharePopupOpen(true);
  };

  const handleSelectRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navigation
        signOut={signOut}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        profile={profile}
        user={user}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <RecordingForm
            onClose={() => setShowForm(false)}
            onSave={fetchRecordings}
          />
        </div>
      )}

      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AudioUploadForm
            onClose={() => setShowUploadForm(false)}
            onUpload={fetchRecordings}
          />
        </div>
      )}

      {showDetails && selectedRecording && user && (
        <RecordingDetails
          recording={selectedRecording}
          userId={user.id}
          onClose={() => {
            setShowDetails(false);
            setSelectedRecording(null);
          }}
          onDelete={handleDelete}
        />
      )}

      <SharePopup
        isOpen={isSharePopupOpen}
        onClose={() => {
          setIsSharePopupOpen(false);
          setSelectedRecording(null);
        }}
        resourceId={selectedRecording?.id || ''}
        resourceType="recording"
        resourceTitle={selectedRecording?.title || ''}
      />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Recordings</h1>
            <div className="flex space-x-4">
              <Button onClick={() => setShowForm(true)} className="bg-red-500">
                <Mic className="h-4 w-4  bg-red-500" />
              </Button>
              <Button onClick={() => setShowUploadForm(true)}>
                <Upload className="h-4 w-4 " />
              </Button>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          <RecordingList
            recordings={recordings}
            onDelete={handleDelete}
            onShare={handleShare}
            onSelect={handleSelectRecording}
            selectedRecording={selectedRecording}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Recordings;
