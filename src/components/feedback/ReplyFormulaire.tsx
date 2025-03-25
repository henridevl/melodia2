import React, { useState } from 'react';
import { CornerDownRight } from 'lucide-react';

interface ReplyFormProps {
  onReply: (replyText: string) => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ onReply }) => {
  const [replyText, setReplyText] = useState('');

  return (
    <div className="mt-4 ml-8 flex items-center space-x-2">
      <CornerDownRight size={16} className="text-gray-400" />
      <div className="flex-1">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Écrire une réponse..."
          rows={2}
        />
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={() => {
              setReplyText('');
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={() => onReply(replyText)}
            disabled={!replyText.trim()}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Répondre
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyForm;
