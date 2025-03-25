import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AudioContextType {
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <AudioContext.Provider value={{ currentTime, setCurrentTime }}>
      {children}
    </AudioContext.Provider>
  );
};
