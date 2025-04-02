// components/Navigation.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Music,
  Settings,
  LogOut,
  Home,
  FileText,
  Mic,
  Bell,
  Share2,
  MusicIcon, // Ajoutez cette icône si elle n'existe pas déjà
} from 'lucide-react';
import NotificationList from './NotificationList';
import { supabase } from '../services/supabase';

interface NavigationProps {
  signOut: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isNavOpen: boolean;
  setIsNavOpen: (isOpen: boolean) => void;
  profile?: { first_name?: string; last_name?: string };
  user?: { email?: string };
  children: React.ReactNode;
  notifications: any[];
  notificationCount: number;
}

const Navigation: React.FC<NavigationProps> = ({
  signOut,
  isMenuOpen,
  setIsMenuOpen,
  isNavOpen,
  setIsNavOpen,
  profile,
  user,
  children,
  notifications,
  notificationCount,
}) => {
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target as Node)
    ) {
      setIsNotificationsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen, handleClickOutside]);

  const handleOverlayClick = () => {
    if (isNavOpen) setIsNavOpen(false);
    if (isMenuOpen) setIsMenuOpen(false);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  return (
    <div className="flex">
      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-indigo-700 text-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-4">
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-2 hover:bg-indigo-600"
          >
            <Home className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
          <Link
            to="/notes"
            className="flex items-center px-4 py-2 hover:bg-indigo-600"
          >
            <FileText className="h-5 w-5 mr-2" />
            Notes
          </Link>
          <Link
            to="/recordings"
            className="flex items-center px-4 py-2 hover:bg-indigo-600"
          >
            <Mic className="h-5 w-5 mr-2" />
            Recordings
          </Link>
          <Link
            to="/compositions"
            className="flex items-center px-4 py-2 hover:bg-indigo-600"
          >
            <MusicIcon className="h-5 w-5 mr-2" />
            Compositions
          </Link>
          <Link
            to="/shared"
            className="flex items-center px-4 py-2 hover:bg-indigo-600"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Shared
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-transform duration-300 ease-in-out ${
          isNavOpen ? 'translate-x-64' : 'translate-x-0'
        }`}
      >
        <nav className="bg-indigo-600 text-white shadow-md relative h-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="text-white hover:text-indigo-200 focus:outline-none hidden lg:block"
              >
                <Menu className="h-8 w-8" />
              </button>
              <Music className="h-8 w-8 text-white ml-2" />
              <span className="ml-2 text-xl font-bold">Melodia</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/*
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                >
                  <Bell className="h-6 w-6 text-white" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>
                  */}
                {isNotificationsOpen && (
                  <div ref={notificationRef}>
                    <NotificationList
                      notifications={notifications}
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
                >
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-indigo-600">
                    <span className="font-medium">
                      {profile?.first_name?.[0] ||
                        user?.email?.[0].toUpperCase()}
                    </span>
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={signOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-0">{children}</div>
      </div>

      {/* Overlay to close menu on click outside */}
      {isNavOpen && (
        <div
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black opacity-50"
        ></div>
      )}

      {/* Quick Action Buttons for Small Screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-indigo-600 p-4 flex justify-around lg:hidden z-50">
        <Link to="/dashboard" className="text-white hover:text-indigo-200">
          <Home className="h-6 w-6" />
        </Link>
        <Link to="/notes" className="text-white hover:text-indigo-200">
          <FileText className="h-6 w-6" />
        </Link>
        <Link to="/recordings" className="text-white hover:text-indigo-200">
          <Mic className="h-6 w-6" />
        </Link>
        <Link to="/compositions" className="text-white hover:text-indigo-200">
          <MusicIcon className="h-6 w-6" />
        </Link>
        <Link to="/shared" className="text-white hover:text-indigo-200">
          <Share2 className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
