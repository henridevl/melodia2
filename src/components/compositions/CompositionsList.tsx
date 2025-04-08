// components/compositions/CompositionsList.tsx
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Composition } from '../../services/supabase';
import Button from '../ui/Button';

interface CompositionsListProps {
  compositions: Composition[];
  onEdit: (composition: Composition) => void;
  onDelete: (compositionId: string) => void;
  onSelect: (composition: Composition) => void;
  selectedComposition: Composition | null;
  loading: boolean;
  viewMode: 'list' | 'gallery';
}

const CompositionsList: React.FC<CompositionsListProps> = ({
  compositions,
  onEdit,
  onDelete,
  onSelect,
  selectedComposition,
  loading,
  viewMode,
}) => {
  if (loading) {
    return <div className="text-center text-gray-500">Loading compositions...</div>;
  }

  if (compositions.length === 0) {
    return <div className="text-center text-gray-500">No compositions found.</div>;
  }

  return (
    <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
      {compositions.map((composition) => (
        <div
          key={composition.id}
          className={`p-4 rounded-lg shadow cursor-pointer ${
            selectedComposition?.id === composition.id ? 'bg-indigo-100' : 'bg-white'
          }`}
        >
          <div 
            className="flex justify-between items-center "
            onClick={() => onEdit(composition)}
            >
            <h3 className="text-lg font-medium text-gray-900">{composition.title}</h3>
            <div className="flex space-x-2">
              
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Empêche la propagation de l'événement au parent
                onDelete(composition.id);
              }}
              color="red"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            </div>
          </div>
          {/*<p className="mt-2 text-sm text-gray-600">{composition.description}</p>
          <button
            onClick={() => onSelect(composition)}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            View Details
        </button>*/}
        </div>
      ))}
    </div>
  );
};

export default CompositionsList;
