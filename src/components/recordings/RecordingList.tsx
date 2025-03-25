import React, { useState } from 'react';
import { Recording } from '../../services/supabase';
import RecordingCard from './RecordingCard';
import { List, Grid } from 'lucide-react';

interface RecordingListProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onShare: (recording: Recording) => void;
  onSelect: (recording: Recording) => void;
  selectedRecording: Recording | null;
}

const RecordingList: React.FC<RecordingListProps> = ({
  recordings,
  onDelete,
  onShare,
  onSelect,
  selectedRecording,
}) => {
  const [isGridView, setIsGridView] = useState(false);

  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleView}
          className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 flex items-center"
        >
          {isGridView ? <List size={16} /> : <Grid size={16} />}
        </button>
      </div>
      <div
        className={
          isGridView
            ? 'grid grid-cols-2 sm:grid-cols-3 gap-4'
            : 'space-y-1 sm:space-y-4'
        }
      >
        {recordings.map((recording) => (
          <div
            key={recording.id}
            onClick={() => onSelect(recording)}
            className={`p-1 sm:p-4 text-xs sm:text-base cursor-pointer`}
          >
            <RecordingCard
              recording={recording}
              onDelete={onDelete}
              onShare={onShare}
              isSelected={selectedRecording?.id === recording.id} // Passez isSelected ici
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordingList;
