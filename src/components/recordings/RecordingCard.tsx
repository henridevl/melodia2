import React, { useState, useRef } from 'react';
import { Recording } from '../../services/supabase';
import { Trash2, Share2, Download } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import SharePopup from '../ui/SharePopup';
import ConfirmationDialog from '../ui/ConfirmationDialog';

interface RecordingCardProps {
  recording: Recording;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (recording: Recording) => void;
  onOpenDetails: (recording: Recording) => void; // Ajout de cette prop pour ouvrir les détails
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const RecordingCard: React.FC<RecordingCardProps> = ({
  recording,
  onDelete,
  isSelected,
  onSelect,
  onOpenDetails,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const audioPlayerRef = useRef<HTMLDivElement>(null);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const handleDelete = () => {
    setIsConfirmationOpen(true);
  };

  const confirmDelete = () => {
    onDelete(recording.id);
    setIsConfirmationOpen(false);
  };

  const cancelDelete = () => {
    setIsConfirmationOpen(false);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      audioPlayerRef.current &&
      audioPlayerRef.current.contains(e.target as Node)
    ) {
      return;
    }
  };

  const handleDownload = () => {
    const filename = recording.audio_url.split('/').pop();
    const downloadUrl = `/download/${filename}`;
    window.location.href = downloadUrl;
  };

  const formattedDate = formatDate(recording.date);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-2 sm:p-4 flex flex-col text-xs sm:text-base w-full ${
        isSelected ? 'border-2 border-yellow-400' : ''
      } cursor-pointer`}
      onClick={handleCardClick}
      style={{ transition: 'border-color 0.3s ease' }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white mb-1 sm:mb-0">
          {recording.title}
        </h3>
        <div className="flex items-center space-x-2">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {formattedDate}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPopup();
            }}
            className="text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label="Share recording"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label="Download recording"
          >
            <Download size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-red-600 hover:text-red-800 transition-colors"
            aria-label={`Delete ${recording.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div ref={audioPlayerRef}>
        <AudioPlayer
          audioUrl={recording.audio_url}
          resourceId={recording.id}
          resourceType="recording"
        />
      </div>

      <SharePopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        resourceId={recording.id}
        resourceType="recording"
        resourceTitle={recording.title}
      />

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Êtes-vous sûr de vouloir supprimer cet enregistrement ?"
      />
    </div>
  );
};

export default RecordingCard;
