// NotesList.tsx
import React from 'react';
import { Note } from '../../services/supabase';
import { formatDate } from '../../utils/formatDate';
import { Pencil, Trash2, Share2 } from 'lucide-react';
import SharePopup from '../ui/SharePopup';
import ConfirmationDialog from '../ui/ConfirmationDialog';

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onSelect: (note: Note) => void;
  selectedNote: Note | null;
  loading?: boolean;
  viewMode: 'list' | 'gallery'; // Ajoutez cette prop
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  onEdit,
  onDelete,
  onSelect,
  selectedNote,
  loading,
  viewMode,
}) => {
  const [selectedNoteForShare, setSelectedNoteForShare] =
    React.useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = React.useState<Note | null>(null);

  const handleDelete = (note: Note) => {
    setNoteToDelete(note);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      onDelete(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const cancelDelete = () => {
    setNoteToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No notes yet. Create your first note!</p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'gallery'
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'space-y-4'
      }
    >
      {notes.map((note) => (
        <div
          key={note.id}
          className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
            selectedNote?.id === note.id ? 'ring-2 ring-indigo-500' : ''
          }`}
          onClick={() => onSelect(note)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {note.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{note.content}</p>
              <p className="mt-2 text-xs text-gray-500">
                {formatDate(note.created_at)}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                }}
                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNoteForShare(note);
                }}
                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note);
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {selectedNoteForShare && (
        <SharePopup
          isOpen={!!selectedNoteForShare}
          onClose={() => setSelectedNoteForShare(null)}
          resourceId={selectedNoteForShare.id}
          resourceType="note"
          resourceTitle={selectedNoteForShare.title}
        />
      )}

      <ConfirmationDialog
        isOpen={!!noteToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Êtes-vous sûr de vouloir supprimer cette note ?"
      />
    </div>
  );
};

export default NotesList;
