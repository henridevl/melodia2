// FeedbackItem.tsx
import React, { useState } from 'react';
import { Feedback as FeedbackType } from '../../services/supabase';
import {
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  Edit,
  Trash,
  CornerDownRight,
} from 'lucide-react';
import ReplyForm from './ReplyFormulaire';
import { getUserInitials } from '../../utils/utils'; // Importez la fonction ici

interface FeedbackItemProps {
  feedback: FeedbackType;
  userId: string;
  onReply: (feedback: FeedbackType) => void;
  onEdit: (feedback: FeedbackType) => void;
  onDelete: (feedback: FeedbackType) => void;
  onToggleLike: (id: string) => void;
  onToggleMarkAsOk: (id: string) => void;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({
  feedback,
  userId,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleMarkAsOk,
}) => {
  const [editingFeedback, setEditingFeedback] = useState<FeedbackType | null>(
    null
  );
  const [replyingTo, setReplyingTo] = useState<FeedbackType | null>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingFeedback) {
        onEdit(editingFeedback);
      }
    }
  };

  return (
    <div className="bg-white p-4 mb-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-gray-300 text-gray-700">
            {getUserInitials(feedback.user_id)} {/* Utilisez la fonction ici */}
          </div>
          <div>
            <span className="font-semibold text-gray-800">
              {profile
                ? `${profile.first_name} ${profile.last_name}`
                : 'Utilisateur'}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {new Date(feedback.created_at).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleLike(feedback.id)}
            className={`text-gray-500 hover:text-gray-700 flex items-center ${
              feedback.liked_by?.includes(userId) ? 'text-blue-500' : ''
            }`}
            aria-label="Like"
          >
            <ThumbsUp size={16} />
            <span className="ml-1 text-xs">{feedback.likes || 0}</span>
          </button>
          <button
            onClick={() => setReplyingTo(feedback)}
            className={`text-gray-500 hover:text-gray-700 ${
              replyingTo?.id === feedback.id ? 'text-blue-500' : ''
            }`}
            aria-label="Reply"
          >
            <MessageCircle size={16} />
          </button>
          <button
            onClick={() => onToggleMarkAsOk(feedback.id)}
            className={`text-gray-500 hover:text-gray-700 ${
              feedback.is_ok ? 'text-green-500' : ''
            }`}
            aria-label="Mark as OK"
          >
            <CheckCircle size={16} />
          </button>
          <button
            onClick={() => setEditingFeedback(feedback)}
            className="text-gray-500 hover:text-blue-600"
            aria-label="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(feedback)}
            className="text-gray-500 hover:text-red-600"
            aria-label="Delete"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      <div>
        {editingFeedback?.id === feedback.id ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editingFeedback.comment}
              onChange={(e) =>
                setEditingFeedback({
                  ...editingFeedback,
                  comment: e.target.value,
                })
              }
              onKeyDown={(e) => handleKeyDown(e, feedback.id)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => onEdit(editingFeedback)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Valider
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500">
              @{feedback.timestamp_seconds?.toFixed(1)}
            </p>
            <p className="text-gray-700">{feedback.comment}</p>
          </>
        )}
      </div>

      {/* Reply Form */}
      {replyingTo?.id === feedback.id && (
        <div className="mt-4 ml-8 flex items-center space-x-2">
          <CornerDownRight size={16} className="text-gray-400" />
          <ReplyForm
            onReply={(replyText) =>
              onReply({ ...feedback, comment: replyText })
            }
          />
        </div>
      )}

      {/* Replies */}
      {feedbacks
        .filter((fb) => fb.parent_id === feedback.id)
        .map((reply) => (
          <div
            key={reply.id}
            className="ml-8 mt-2 p-4 bg-gray-100 rounded-lg shadow"
          >
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-gray-300 text-gray-700">
                  {getUserInitials(reply.user_id)}{' '}
                  {/* Utilisez la fonction ici */}
                </div>
                <div>
                  <span className="font-semibold text-gray-800">
                    {profile
                      ? `${profile.first_name} ${profile.last_name}`
                      : 'Utilisateur'}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  onClick={() => setEditingFeedback(reply)}
                  className="text-gray-500 hover:text-blue-600"
                  aria-label="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(reply)}
                  className="text-gray-500 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            <div>
              {editingFeedback?.id === reply.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingFeedback.comment}
                    onChange={(e) =>
                      setEditingFeedback({
                        ...editingFeedback,
                        comment: e.target.value,
                      })
                    }
                    onKeyDown={(e) => handleKeyDown(e, reply.id)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => onEdit(editingFeedback)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Valider
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-500">
                    @{reply.timestamp_seconds?.toFixed(1)}
                  </p>
                  <p className="text-gray-700">{reply.comment}</p>
                </>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default FeedbackItem;
