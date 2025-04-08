// hooks/useItemSelector.ts
import { useState, useEffect, useMemo, useCallback } from 'react';

const useItemSelector = (initialItems: any[], fetchItems: () => Promise<any[]>) => {
  const [selectedItems, setSelectedItems] = useState<any[]>(initialItems);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      const items = await fetchItems();
      setAvailableItems(items);
    };
    loadItems();
  }, [fetchItems]);

  const addItem = useCallback((item: any) => {
    setSelectedItems((prevItems) => [...prevItems, item]);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setSelectedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const filteredAvailableItems = useMemo(() => {
    const filtered = availableItems.filter((item) => !selectedItems.find((si) => si.id === item.id));
    if (!searchTerm) return filtered;
    return filtered.filter((item) => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableItems, selectedItems, searchTerm]);

  return {
    selectedItems,
    availableItems: filteredAvailableItems,
    showSelector,
    setShowSelector,
    addItem,
    removeItem,
    searchTerm,
    setSearchTerm
  };
};

export default useItemSelector;
