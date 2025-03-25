import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext'; // Assurez-vous que le chemin est correct
import AppRoutes from './routes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AudioProvider>
          <AppRoutes />
        </AudioProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
