import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Recording, Feedback } from '../../services/supabase';
import AudioPlayer from './AudioPlayer';
import FeedbackComponent from '../feedback/FeedbackComponent';
import Button from '../ui/Button';
import { X } from 'lucide-react';

interface RecordingDetailsProps {
  recording: Recording;
  userId: string;
  onClose: () => void;
  onDelete?: (id: string) => void;
  isShared?: boolean;
}

const RecordingDetails: React.FC<RecordingDetailsProps> = ({
  recording,
  userId,
  onClose,
  onDelete,
  isShared = false,
}) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, [recording.id]);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('recording_id', recording.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">{recording.title}</h2>
            <Button variant="secondary" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <AudioPlayer
              audioUrl={recording.audio_url}
              resourceId={recording.id}
              resourceType="recording"
            />

            <div className="border-t border-gray-200 pt-6">
              <FeedbackComponent
                resourceId={recording.id}
                resourceType="recording"
                userId={userId}
                onFeedbackAdded={fetchFeedbacks}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingDetails;