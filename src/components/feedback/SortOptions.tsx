import React from 'react';
import { SortAsc, SortDesc, ChevronUp, ChevronDown } from 'lucide-react';

interface SortOptionsProps {
  sortBy: 'date' | 'likes';
  sortDirection: 'asc' | 'desc';
  showSortOptions: boolean;
  setSortBy: (sortBy: 'date' | 'likes') => void;
  setSortDirection: (sortDirection: 'asc' | 'desc') => void;
  setShowSortOptions: (show: boolean) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({
  sortBy,
  sortDirection,
  showSortOptions,
  setSortBy,
  setSortDirection,
  setShowSortOptions,
}) => {
  return (
    <div className="relative">
      <button
        onClick={() => setShowSortOptions(!showSortOptions)}
        className="border rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Sort Options"
      >
        {sortBy === 'date' ? (
          <SortAsc className="h-4 w-4" />
        ) : (
          <SortDesc className="h-4 w-4" />
        )}
      </button>
      {showSortOptions && (
        <div className="absolute left-0 mt-2 w-32 bg-white border rounded-lg shadow-lg">
          <button
            onClick={() => {
              setSortBy('date');
              setShowSortOptions(false);
            }}
            className={`w-full text-left p-2 hover:bg-gray-100 ${
              sortBy === 'date' ? 'bg-blue-100' : ''
            }`}
          >
            Date
          </button>
          <button
            onClick={() => {
              setSortBy('likes');
              setShowSortOptions(false);
            }}
            className={`w-full text-left p-2 hover:bg-gray-100 ${
              sortBy === 'likes' ? 'bg-blue-100' : ''
            }`}
          >
            Likes
          </button>
        </div>
      )}
      <button
        onClick={() =>
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        }
        className="border rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle Sort Direction"
      >
        {sortDirection === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default SortOptions;
