// components/form/RecordingSelector.tsx
import React from 'react';
import { Music, Plus, Trash, X } from 'lucide-react';
import Button from '../ui/Button';
import AudioPlayer from '../recordings/AudioPlayer';

interface RecordingSelectorProps {
  selectedRecordings: any[];
  availableRecordings: any[];
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addRecording: (recording: any) => void;
  removeRecording: (recordingId: string) => void;
}

const RecordingSelector: React.FC<RecordingSelectorProps> = ({
  selectedRecordings,
  availableRecordings,
  showSelector,
  setShowSelector,
  searchTerm,
  setSearchTerm,
  addRecording,
  removeRecording
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Recordings
        </label>
        <Button
          type="button"
          onClick={() => setShowSelector(true)}
          variant="secondary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Recording
        </Button>
      </div>

      <div className="space-y-2">
        {selectedRecordings.map((recording) => (
          <div
            key={recording.id}
            className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Music className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  {recording.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => removeRecording(recording.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
            <AudioPlayer
              audioUrl={recording.audio_url}
              resourceId={recording.id}
              resourceType="recording"
            />
          </div>
        ))}
      </div>

      {showSelector && (
        <div className="mt-4 p-4 border rounded-md bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Select Recordings</h4>
            <button
              type="button"
              onClick={() => setShowSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search recordings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4 p-2 border rounded-md"
          />
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableRecordings.map((recording) => (
              <button
                key={recording.id}
                type="button"
                onClick={() => addRecording(recording)}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-md flex items-center space-x-3"
              >
                <Music className="h-4 w-4 text-indigo-500" />
                <span>{recording.title}</span>
              </button>
            ))}
            {availableRecordings.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No recordings available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingSelector;
