import React from 'react';
import { Feedback as FeedbackType } from '../../services/supabase';
import FeedbackItem from './Feedbackcard';

interface FeedbackListProps {
  feedbacks: FeedbackType[];
  userId: string;
  onReply: (feedback: FeedbackType) => void;
  onEdit: (feedback: FeedbackType) => void;
  onDelete: (feedback: FeedbackType) => void;
  onToggleLike: (id: string) => void;
  onToggleMarkAsOk: (id: string) => void;
}

const FeedbackList: React.FC<FeedbackListProps> = ({
  feedbacks,
  userId,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleMarkAsOk,
}) => {
  return (
    <div className="overflow-y-auto max-h-[400px]">
      {feedbacks
        .filter((fb) => !fb.parent_id) // Filtrer les feedbacks parents
        .map((feedback) => (
          <FeedbackItem
            key={feedback.id}
            feedback={feedback}
            userId={userId}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleLike={onToggleLike}
            onToggleMarkAsOk={onToggleMarkAsOk}
          />
        ))}
    </div>
  );
};

export default FeedbackList;
