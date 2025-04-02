// components/compositions/CompositionDetails.tsx
import React from 'react';
import type { Composition } from '../../services/supabase';
import Button from '../ui/Button';

interface CompositionDetailsProps {
  composition: Composition;
  userId: string;
  onClose: () => void;
  onDelete: (compositionId: string) => void;
}

const CompositionDetails: React.FC<CompositionDetailsProps> = ({ composition, userId, onClose, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{composition.title}</h2>
        <Button onClick={onClose} >
          Close
        </Button>
      </div>
      <p className="text-sm text-gray-600">{composition.description}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button onClick={() => onDelete(composition.id)} color="red">
          Delete
        </Button>
      </div>
    </div>
  );
};

export default CompositionDetails;
