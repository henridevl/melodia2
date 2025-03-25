import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Share2, X, Copy, RefreshCw, Check, AlertCircle } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceType: 'recording' | 'note';
  resourceTitle: string;
}

interface ShareInfo {
  id: string;
  shared_with_email: string;
  permission_level: 'view' | 'edit';
  status: 'pending' | 'accepted';
  created_at: string;
}

const SharePopup: React.FC<SharePopupProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceType,
  resourceTitle,
}) => {
  const [email, setEmail] = useState('');
  const [shares, setShares] = useState<ShareInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'edit'>(
    'view'
  );
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchShares();
      generateShareLink();
    }
  }, [isOpen, resourceId]);

  const fetchShares = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('resource_id', resourceId)
        .eq('resource_type', resourceType);

      if (error) throw error;
      setShares(data || []);
    } catch (err) {
      console.error('Error fetching shares:', err);
      setError('Failed to load sharing information');
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/share/${resourceId}`;
    setShareLink(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000); // Reset message after 2 seconds
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    console.log('handleShare called');

    try {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      console.log('Email pattern:', emailPattern);

      if (!emailPattern.test(email)) {
        console.log('Invalid email format');
        setError('Invalid email format');
        return;
      }

      console.log('Email format is valid');

      const existingShare = shares.find((s) => s.shared_with_email === email);
      if (existingShare) {
        console.log('Already shared with this email');
        setError('Already shared with this email');
        return;
      }

      console.log('No existing share found');

      if (!user) {
        console.log('User is not authenticated');
        setError('You must be logged in to share resources');
        return;
      }

      console.log('User is authenticated');

      const shareData = {
        resource_id: resourceId,
        resource_type: resourceType,
        shared_with_email: email,
        permission_level: permissionLevel,
        owner_id: user.id,
      };

      console.log('Attempting to insert share data:', shareData);

      const { error: shareError } = await supabase
        .from('shares')
        .insert([shareData]);

      if (shareError) throw shareError;

      console.log('Share inserted successfully');

      setSuccessMessage('Invitation sent successfully');
      setEmail('');
      await fetchShares();
    } catch (err) {
      console.error('Error sharing:', err);
      setError('Failed to share. Please try again.');
    } finally {
      setLoading(false);
      console.log('handleShare completed');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      await fetchShares();
    } catch (err) {
      console.error('Error removing share:', err);
      setError('Failed to remove share');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Share {resourceType === 'recording' ? 'Recording' : 'Note'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{resourceTitle}</h3>
          </div>

          <form onSubmit={handleShare} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permission
              </label>
              <select
                value={permissionLevel}
                onChange={(e) =>
                  setPermissionLevel(e.target.value as 'view' | 'edit')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-sm text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-1" />
                {successMessage}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sharing...' : 'Share'}
            </Button>
          </form>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-4">
              People with access
            </h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Loading...
                </p>
              ) : shares.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No shares yet
                </p>
              ) : (
                shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {share.shared_with_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {share.permission_level === 'edit'
                          ? 'Can edit'
                          : 'Can view'}{' '}
                        • {share.status === 'pending' ? 'Pending' : 'Accepted'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveShare(share.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove share"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="font-medium text-gray-900 mb-2">Share Link</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleCopyLink}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Copy link"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            {copySuccess && (
              <div className="text-sm text-green-600 flex items-center mt-2">
                <Check className="h-4 w-4 mr-1" />
                Link copied to clipboard!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
