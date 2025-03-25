import React from 'react';
import { Filter } from 'lucide-react';

interface FilterOptionsProps {
  filterBy: 'all' | 'ok' | 'notOk';
  showFilterOptions: boolean;
  setFilterBy: (filterBy: 'all' | 'ok' | 'notOk') => void;
  setShowFilterOptions: (show: boolean) => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
  filterBy,
  showFilterOptions,
  setFilterBy,
  setShowFilterOptions,
}) => {
  return (
    <div className="relative">
      <button
        onClick={() => setShowFilterOptions(!showFilterOptions)}
        className="border rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Filter Options"
      >
        <Filter className="h-4 w-4" />
      </button>
      {showFilterOptions && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg">
          <button
            onClick={() => {
              setFilterBy('all');
              setShowFilterOptions(false);
            }}
            className={`w-full text-left p-2 hover:bg-gray-100 ${
              filterBy === 'all' ? 'bg-blue-100' : ''
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => {
              setFilterBy('ok');
              setShowFilterOptions(false);
            }}
            className={`w-full text-left p-2 hover:bg-gray-100 ${
              filterBy === 'ok' ? 'bg-blue-100' : ''
            }`}
          >
            OK
          </button>
          <button
            onClick={() => {
              setFilterBy('notOk');
              setShowFilterOptions(false);
            }}
            className={`w-full text-left p-2 hover:bg-gray-100 ${
              filterBy === 'notOk' ? 'bg-blue-100' : ''
            }`}
          >
            Non OK
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterOptions;
