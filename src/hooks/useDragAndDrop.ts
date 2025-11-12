import { useState } from 'react';

export interface DragItem {
  id: string;
  index: number;
}

export function useDragAndDrop<T extends { id: string }>(
  items: T[],
  onReorder: (items: T[]) => void
) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const handleDragStart = (id: string, index: number) => {
    setDraggedItem({ id, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedItem) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedItem.index, 1);
    newItems.splice(targetIndex, 0, removed);

    onReorder(newItems);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
}
