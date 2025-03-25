import React, { useState } from 'react';
import { useRecording } from '../../hooks/useRecording';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { Pause, Play, StopCircle, Save, Trash2, Mic } from 'lucide-react';
import Button from '../ui/Button';

interface RecordingFormProps {
  onClose: () => void;
  onSave: () => void;
}

const RecordingForm: React.FC<RecordingFormProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const {
    state,
    duration,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording,
  } = useRecording(user?.id || '');

  const handleSave = async () => {
    try {
      if (!user || !audioUrl || !title) return;

      const fileName = `${user.id}/${Date.now()}.webm`;
      
      // Convert audio blob URL to actual blob
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, blob, {
          contentType: 'audio/webm',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

      // Save recording metadata to database
      const { error: dbError } = await supabase
        .from('recordings')
        .insert([
          {
            title,
            audio_url: publicUrl,
            duration: formatTime(duration),
            date: new Date().toISOString(),
            user_id: user.id,
          },
        ]);

      if (dbError) throw dbError;

      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving recording:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">New Recording</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl font-mono mb-4">{formatTime(duration)}</div>
          
          <div className="flex space-x-4">
            {state === 'inactive' && !audioUrl && (
              <Button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            )}

            {state === 'recording' && (
              <>
                <Button onClick={pauseRecording}>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
                <Button onClick={stopRecording}>
                  <StopCircle className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}

            {state === 'paused' && (
              <>
                <Button onClick={resumeRecording}>
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
                <Button onClick={stopRecording}>
                  <StopCircle className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {audioUrl && (
          <div className="space-y-4">
            <audio
              src={audioUrl}
              controls
              className="w-full"
            />

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recording Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a title for your recording"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={discardRecording}
                variant="secondary"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Recording
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingForm;