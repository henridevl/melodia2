import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import type { Profile, Recording, Note } from '../services/supabase';
import Navigation from '../components/Navigation';
import { Share2, FileAudio, FileText, Check, X } from 'lucide-react';
import Button from '../components/ui/Button';
import RecordingDetails from '../components/recordings/RecordingDetails';
import NoteDetails from '../components/notes/NoteDetails';

interface SharedItem {
  id: string;
  resource_id: string;
  resource_type: string;
  title: string;
  owner_email: string;
  permission_level: 'view' | 'edit';
  status: 'pending' | 'accepted';
  created_at: string;
  resource?: Recording | Note;
}

const SharedDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'recording' | 'note'>(
    'all'
  );
  const [selectedItem, setSelectedItem] = useState<SharedItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSharedItems();
      fetchNotifications();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSharedItems = async () => {
    try {
      setLoading(true);
      const { data: shares, error: sharesError } = await supabase
        .from('shares')
        .select(
          `
          id,
          resource_id,
          resource_type,
          permission_level,
          status,
          created_at,
          profiles!shares_owner_id_fkey (
            email
          )
        `
        )
        .eq('shared_with_email', user?.email);

      if (sharesError) throw sharesError;

      const sharedItemsWithDetails = await Promise.all(
        (shares || []).map(async (share) => {
          let resource;
          const { data } = await supabase
            .from(share.resource_type === 'recording' ? 'recordings' : 'notes')
            .select('*')
            .eq('id', share.resource_id)
            .single();

          resource = data;

          return {
            ...share,
            title: resource?.title || 'Untitled',
            owner_email: share.profiles?.email || 'Unknown',
            resource,
          };
        })
      );

      setSharedItems(sharedItemsWithDetails);
      setError(null);
    } catch (err) {
      console.error('Error fetching shared items:', err);
      setError('Failed to load shared items');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data: sharedItems, error: sharedItemsError } = await supabase
        .from('shares')
        .select('*')
        .eq('shared_with_email', user.email);

      if (sharedItemsError) throw sharedItemsError;

      let combinedNotifications = [
        ...sharedItems.map((item) => ({
          id: item.id,
          message: `Shared with you: ${item.title}`,
          read: item.read,
        })),
      ];

      try {
        const { data: feedback, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .eq('user_id', user.id);

        if (feedbackError) throw feedbackError;

        combinedNotifications = [
          ...combinedNotifications,
          ...feedback.map((fb) => ({
            id: fb.id,
            message: `New feedback on ${fb.resource_type}: ${fb.content}`,
            read: fb.read,
          })),
        ];
      } catch (feedbackError) {
        console.warn(
          'Feedback table does not exist or there was an error fetching feedback:',
          feedbackError
        );
      }

      setNotifications(combinedNotifications);
      setNotificationCount(
        combinedNotifications.filter((notification) => !notification.read)
          .length
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAcceptShare = async (shareId: string) => {
    try {
      console.log('Accepting share with ID:', shareId);
      const { error } = await supabase
        .from('shares')
        .update({ status: 'accepted' })
        .eq('id', shareId);

      if (error) throw error;
      console.log('Share accepted successfully');
      await fetchSharedItems();
      await fetchNotifications();
    } catch (err) {
      console.error('Error accepting share:', err);
      setError('Failed to accept share');
    }
  };

  const handleRejectShare = async (shareId: string) => {
    try {
      console.log('Rejecting share with ID:', shareId);
      const { error } = await supabase
        .from('shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      console.log('Share rejected successfully');
      await fetchSharedItems();
      await fetchNotifications();
    } catch (err) {
      console.error('Error rejecting share:', err);
      setError('Failed to reject share');
    }
  };

  const handleItemClick = (item: SharedItem) => {
    if (item.status === 'accepted') {
      setSelectedItem(item);
      setShowDetails(true);
    }
  };

  const filteredItems = sharedItems.filter((item) => {
    const statusMatch = filter === 'all' || item.status === filter;
    const typeMatch = typeFilter === 'all' || item.resource_type === typeFilter;
    return statusMatch && typeMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        signOut={signOut}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        profile={profile}
        user={user}
        notifications={notifications}
        notificationCount={notificationCount}
      />

      {showDetails &&
        selectedItem &&
        user &&
        (selectedItem.resource_type === 'recording' ? (
          <RecordingDetails
            recording={selectedItem.resource as Recording}
            userId={user.id}
            onClose={() => {
              setShowDetails(false);
              setSelectedItem(null);
            }}
            isShared={true}
          />
        ) : (
          <NoteDetails
            note={selectedItem.resource as Note}
            userId={user.id}
            onClose={() => {
              setShowDetails(false);
              setSelectedItem(null);
            }}
            isShared={true}
          />
        ))}

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Shared with me
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage content that has been shared with you
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as typeof typeFilter)
                }
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="recording">Recordings</option>
                <option value="note">Notes</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Share2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No shared items
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No content has been shared with you yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      // Only handle click if not clicking on buttons
                      if (!(e.target as HTMLElement).closest('button')) {
                        handleItemClick(item);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {item.resource_type === 'recording' ? (
                          <FileAudio className="h-6 w-6 text-indigo-600" />
                        ) : (
                          <FileText className="h-6 w-6 text-indigo-600" />
                        )}
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.title}
                          </h3>
                          <div className="mt-1">
                            <span className="text-sm text-gray-500">
                              Shared by {item.owner_email} •{' '}
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.permission_level === 'edit'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              Can {item.permission_level}
                            </span>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status === 'pending' ? (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptShare(item.id);
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectShare(item.id);
                              }}
                              variant="secondary"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedDashboard;
