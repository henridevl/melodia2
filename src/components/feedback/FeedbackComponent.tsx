import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

import { Feedback as FeedbackType, Profile } from '../../services/supabase';
import {
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  Trash,
  ChevronUp,
  ChevronDown,
  Send,
  X,
  Filter,
  SortAsc,
  SortDesc,
  CornerDownRight,
  Edit,
} from 'lucide-react';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { useAudioContext } from '../../contexts/AudioContext';

interface FeedbackProps {
  resourceId: string;
  resourceType: 'note' | 'recording';
  userId: string;
  onFeedbackAdded?: () => void;
}

const FeedbackComponent: React.FC<FeedbackProps> = ({
  resourceId,
  resourceType,
  userId,
  onFeedbackAdded,
}) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [replyText, setReplyText] = useState('');
  const [editingFeedback, setEditingFeedback] = useState<FeedbackType | null>(
    null
  );
  const [replyingTo, setReplyingTo] = useState<FeedbackType | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackType | null>(
    null
  );
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'ok' | 'notOk'>('all');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTime } = useAudioContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchFeedbacks();
        await fetchProfile();
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resourceId, resourceType, userId]);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq(resourceType === 'note' ? 'note_id' : 'recording_id', resourceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    setFeedbacks(data);
  };

  const fetchProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    setProfile(data);
  };

  const addFeedback = async (parentId?: string) => {
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          comment: parentId ? replyText : newFeedback,
          user_id: userId,
          [resourceType + '_id']: resourceId,
          parent_id: parentId || null,
          timestamp_seconds: currentTime,
          liked_by: [],
          likes: 0,
        },
      ])
      .select();

    if (error) {
      setError('Failed to add feedback');
      return;
    }
    if (data && data.length > 0) {
      setFeedbacks((prevFeedbacks) => [data[0], ...prevFeedbacks]);
      if (parentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setNewFeedback('');
      }
      if (onFeedbackAdded) {
        onFeedbackAdded();
      }
    }
  };

  const editFeedback = async (id: string, comment: string) => {
    const { error } = await supabase
      .from('feedback')
      .update({ comment })
      .eq('id', id);

    if (error) {
      setError('Failed to edit feedback');
      return;
    }
    setFeedbacks(
      feedbacks.map((fb) => (fb.id === id ? { ...fb, comment } : fb))
    );
    setEditingFeedback(null);
  };

  const toggleLike = async (id: string) => {
    try {
      const feedback = feedbacks.find((fb) => fb.id === id);
      if (!feedback) return;

      const likedBy = feedback.liked_by || [];
      const isLiked = likedBy.includes(userId);
      const newLikedBy = isLiked
        ? likedBy.filter((uid) => uid !== userId)
        : [...likedBy, userId];
      const newLikes = newLikedBy.length;

      // Optimistic update
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((fb) =>
          fb.id === id ? { ...fb, likes: newLikes, liked_by: newLikedBy } : fb
        )
      );

      const { error } = await supabase
        .from('feedback')
        .update({
          likes: newLikes,
          liked_by: newLikedBy,
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      await fetchFeedbacks();
    }
  };

  const toggleMarkAsOk = async (id: string) => {
    const feedback = feedbacks.find((fb) => fb.id === id);
    if (feedback) {
      const newIsOk = !feedback.is_ok;

      const { error } = await supabase
        .from('feedback')
        .update({ is_ok: newIsOk })
        .eq('id', id);

      if (error) {
        setError('Failed to toggle mark as OK');
        return;
      }
      setFeedbacks(
        feedbacks.map((fb) => (fb.id === id ? { ...fb, is_ok: newIsOk } : fb))
      );
    }
  };

  const deleteFeedback = async (id: string) => {
    const { error } = await supabase.from('feedback').delete().eq('id', id);

    if (error) {
      setError('Failed to delete feedback');
      return;
    }
    setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
    setFeedbackToDelete(null);
  };

  const getUserInitials = (userId: string) => {
    if (profile) {
      const { first_name, last_name } = profile;
      return `${first_name.charAt(0).toUpperCase()}${last_name
        .charAt(0)
        .toUpperCase()}`;
    }
    return 'U';
  };

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'likes') {
      const likesA = a.likes || 0;
      const likesB = b.likes || 0;
      return sortDirection === 'asc' ? likesA - likesB : likesB - likesA;
    }
    return 0;
  });

  const filteredFeedbacks = sortedFeedbacks.filter((fb) => {
    if (filterBy === 'all') return true;
    if (filterBy === 'ok') return fb.is_ok;
    if (filterBy === 'notOk') return !fb.is_ok;
    return true;
  });

  const toggleSortDirection = () => {
    setSortDirection((prevDirection) =>
      prevDirection === 'asc' ? 'desc' : 'asc'
    );
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.rows = 3;
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.target.value === '') {
      e.target.rows = 1;
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingFeedback) {
        editFeedback(id, editingFeedback.comment);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-gray-50 p-2 rounded-lg shadow-lg">
      <div className="flex flex-col bg-gray-100 p-2 mb-1 rounded-lg shadow-md w-full ">
        <div className="flex items-center space-x-3">
          <div className="border rounded-lg p-1 flex items-center space-x-3 bg-white w-full">
            <div className="flex justify-between items-center ">
              <span className="text-sm text-gray-500">
                @{currentTime.toFixed(1)}
              </span>
              <button className="focus:outline-none">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <textarea
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              rows={1}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Laissez votre commentaire ici..."
            ></textarea>
            <button
              onClick={() => addFeedback()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1"
              disabled={!newFeedback}
            >
              <Send size={16} />
              <span className="ml-1"></span>
            </button>
          </div>
        </div>
        <div className="flex items-center  p-1">
          <div className="relative">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="border rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sort Options"
            >
              {sortBy === 'date' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </button>
            {showSortOptions && (
              <div className="absolute left-0 mt-2 w-32 bg-white border rounded-lg shadow-lg">
                <button
                  onClick={() => {
                    setSortBy('date');
                    setShowSortOptions(false);
                  }}
                  className={`w-full text-left p-2 hover:bg-gray-100 ${
                    sortBy === 'date' ? 'bg-blue-100' : ''
                  }`}
                >
                  Date
                </button>
                <button
                  onClick={() => {
                    setSortBy('likes');
                    setShowSortOptions(false);
                  }}
                  className={`w-full text-left p-2 hover:bg-gray-100 ${
                    sortBy === 'likes' ? 'bg-blue-100' : ''
                  }`}
                >
                  Likes
                </button>
              </div>
            )}
          </div>
          <button
            onClick={toggleSortDirection}
            className="border rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle Sort Direction"
          >
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
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
        </div>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        {filteredFeedbacks
          .filter((fb) => !fb.parent_id) // Filtrer les feedbacks parents
          .map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white p-4 mb-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-gray-300 text-gray-700">
                    {getUserInitials(feedback.user_id)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">
                      {profile
                        ? `${profile.first_name} ${profile.last_name}`
                        : 'Utilisateur'}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(feedback.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleLike(feedback.id)}
                    className={`text-gray-500 hover:text-gray-700 flex items-center ${
                      feedback.liked_by?.includes(userId) ? 'text-blue-500' : ''
                    }`}
                    aria-label="Like"
                  >
                    <ThumbsUp size={16} />
                    <span className="ml-1 text-xs">{feedback.likes || 0}</span>
                  </button>
                  <button
                    onClick={() => setReplyingTo(feedback)}
                    className={`text-gray-500 hover:text-gray-700 ${
                      replyingTo?.id === feedback.id ? 'text-blue-500' : ''
                    }`}
                    aria-label="Reply"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button
                    onClick={() => toggleMarkAsOk(feedback.id)}
                    className={`text-gray-500 hover:text-gray-700 ${
                      feedback.is_ok ? 'text-green-500' : ''
                    }`}
                    aria-label="Mark as OK"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => setEditingFeedback(feedback)}
                    className="text-gray-500 hover:text-blue-600"
                    aria-label="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setFeedbackToDelete(feedback)}
                    className="text-gray-500 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              <div>
                {editingFeedback?.id === feedback.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingFeedback.comment}
                      onChange={(e) =>
                        setEditingFeedback({
                          ...editingFeedback,
                          comment: e.target.value,
                        })
                      }
                      onKeyDown={(e) => handleKeyDown(e, feedback.id)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() =>
                        editFeedback(feedback.id, editingFeedback.comment)
                      }
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Valider
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500">
                      @{feedback.timestamp_seconds?.toFixed(1)}
                    </p>
                    <p className="text-gray-700">{feedback.comment}</p>
                  </>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo?.id === feedback.id && (
                <div className="mt-4 ml-8 flex items-center space-x-2">
                  <CornerDownRight size={16} className="text-gray-400" />
                  <div className="flex-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Écrire une réponse..."
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => addFeedback(feedback.id)}
                        disabled={!replyText.trim()}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        Répondre
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {feedbacks
                .filter((fb) => fb.parent_id === feedback.id)
                .map((reply) => (
                  <div
                    key={reply.id}
                    className="ml-8 mt-2 p-4 bg-gray-100 rounded-lg shadow"
                  >
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-gray-300 text-gray-700">
                          {getUserInitials(reply.user_id)}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800">
                            {profile
                              ? `${profile.first_name} ${profile.last_name}`
                              : 'Utilisateur'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-auto">
                        <button
                          onClick={() => setEditingFeedback(reply)}
                          className="text-gray-500 hover:text-blue-600"
                          aria-label="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setFeedbackToDelete(reply)}
                          className="text-gray-500 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      {editingFeedback?.id === reply.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingFeedback.comment}
                            onChange={(e) =>
                              setEditingFeedback({
                                ...editingFeedback,
                                comment: e.target.value,
                              })
                            }
                            onKeyDown={(e) => handleKeyDown(e, reply.id)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() =>
                              editFeedback(reply.id, editingFeedback.comment)
                            }
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Valider
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-500">
                            @{reply.timestamp_seconds?.toFixed(1)}
                          </p>
                          <p className="text-gray-700">{reply.comment}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>

      {feedbackToDelete && (
        <ConfirmationDialog
          isOpen={true}
          onConfirm={() => deleteFeedback(feedbackToDelete.id)}
          onCancel={() => setFeedbackToDelete(null)}
          message="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
        />
      )}
    </div>
  );
};

export default FeedbackComponent;
