// components/form/TagInput.tsx
import React from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagAdd: (e: React.KeyboardEvent) => void;
  onTagRemove: (tag: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  tagInput,
  onTagInputChange,
  onTagAdd,
  onTagRemove
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => onTagRemove(tag)}
              className="ml-1.5 inline-flex items-center justify-center text-indigo-400 hover:text-indigo-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={tagInput}
        onChange={onTagInputChange}
        onKeyDown={onTagAdd}
        placeholder="Add tags (press Enter)"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  );
};

export default TagInput;
