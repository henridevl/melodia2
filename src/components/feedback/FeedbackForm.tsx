import React, { useState, useContext } from 'react';
import { Send, X } from 'lucide-react';
import { useAudioContext } from '../../contexts/AudioContext';

interface FeedbackFormProps {
  onAddFeedback: (feedback: string) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onAddFeedback }) => {
  const [newFeedback, setNewFeedback] = useState('');
  const { currentTime } = useAudioContext();

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.rows = 3;
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.target.value === '') {
      e.target.rows = 1;
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="border rounded-lg p-1 flex items-center space-x-3 bg-white w-full">
        <div className="flex justify-between items-center ">
          <span className="text-sm text-gray-500">
            @{currentTime.toFixed(1)}
          </span>
          <button className="focus:outline-none">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <textarea
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={1}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Laissez votre commentaire ici..."
        ></textarea>
        <button
          onClick={() => onAddFeedback(newFeedback)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1"
          disabled={!newFeedback}
        >
          <Send size={16} />
          <span className="ml-1"></span>
        </button>
      </div>
    </div>
  );
};

export default FeedbackForm;
