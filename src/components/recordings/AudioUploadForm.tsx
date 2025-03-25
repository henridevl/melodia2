import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { Save, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

interface RecordingFormProps {
  onClose: () => void;
  onSave: () => void;
}

const AudioUploadForm: React.FC<RecordingFormProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      // Extraire le nom du fichier sans l'extension
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setTitle(fileNameWithoutExtension);
    }
  };

  const handleSave = async () => {
    try {
      if (!user || !audioFile || !title) return;

      const fileName = `${user.id}/${Date.now()}.${audioFile.name
        .split('.')
        .pop()}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioFile, {
          contentType: audioFile.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('recordings').getPublicUrl(fileName);

      // Save recording metadata to database
      const { error: dbError } = await supabase.from('recordings').insert([
        {
          title,
          audio_url: publicUrl,
          duration: formatTime(duration),
          date: new Date().toISOString(),
          user_id: user.id,
        },
      ]);

      if (dbError) throw dbError;

      // Vérifiez que onSave est une fonction avant de l'appeler
      if (typeof onSave === 'function') {
        onSave();
      }
      onClose();
    } catch (err) {
      console.error('Error saving recording:', err);
    }
  };

  const discardRecording = () => {
    setAudioFile(null);
    setAudioUrl(null);
    setDuration(0);
    setTitle(''); // Réinitialiser le titre
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Upload Audio</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">Close</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="mb-4"
          />
        </div>

        {audioUrl && (
          <div className="space-y-4">
            <audio src={audioUrl} controls className="w-full" />

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
              <Button onClick={discardRecording} variant="secondary">
                <Trash2 className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button onClick={handleSave} disabled={!title}>
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

export default AudioUploadForm;
