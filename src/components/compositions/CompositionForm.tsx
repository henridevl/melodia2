// components/compositions/CompositionForm.tsx
import React, { useState, useEffect } from 'react';
import type { Composition } from '../../services/supabase';
import Button from '../ui/Button';

interface CompositionFormProps {
  composition?: Composition;
  onSubmit: (compositionData: Partial<Composition>) => void;
  onCancel: () => void;
}

const CompositionForm: React.FC<CompositionFormProps> = ({ composition, onSubmit, onCancel }) => {
  const [title, setTitle] = useState<string>(composition?.title || '');
  const [description, setDescription] = useState<string>(composition?.description || '');

  useEffect(() => {
    if (composition) {
      setTitle(composition.title);
      setDescription(composition.description || '');
    }
  }, [composition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={4}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit">
          {composition ? 'Update Composition' : 'Create Composition'}
        </Button>
      </div>
    </form>
  );
};

export default CompositionForm;
