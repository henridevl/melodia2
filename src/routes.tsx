import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Recordings from './pages/Record'; // Import the new Recordings component
import SharedDashboard from './pages/ShareDashboard'; // Import the new SharedDashboard component

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  const [blocks, setBlocks] = useState<SharedBlock[]>([
    {
      id: '1',
      name: 'Enregistrement 1',
      type: 'enregistrement',
      permissions: 'view',
      shareLink: 'https://example.com/share/1',
      sharedWith: ['user1', 'user2'],
      lastModified: '2023-10-01',
    },
    {
      id: '2',
      name: 'Note 1',
      type: 'note',
      permissions: 'edit',
      shareLink: 'https://example.com/share/2',
      sharedWith: ['user3'],
      lastModified: '2023-10-02',
    },
    // Ajoutez d'autres blocs ici
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState('');

  const openModal = (blockId: string) => {
    setSelectedBlockId(blockId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEdit = (blockId: string) => {
    openModal(blockId);
  };

  const handleDelete = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/notes"
        element={user ? <Notes /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/recordings"
        element={user ? <Recordings /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/shared"
        element={
          user ? (
            <SharedDashboard
              blocks={blocks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
