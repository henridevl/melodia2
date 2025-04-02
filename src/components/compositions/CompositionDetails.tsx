import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Composition, Recording, Note } from '../../services/supabase';
import Button from '../ui/Button';
import { X, Music, FileText } from 'lucide-react';
import AudioPlayer from '../recordings/AudioPlayer';

interface CompositionDetailsProps {
  composition: Composition;
  userId: string;
  onClose: () => void;
  onDelete: (compositionId: string) => void;
}

const CompositionDetails: React.FC<CompositionDetailsProps> = ({
  composition,
  userId,
  onClose,
  onDelete,
}) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssociatedContent();
  }, [composition.id]);

  const fetchAssociatedContent = async () => {
    try {
      // Fetch associated recordings
      const { data: recordingData, error: recordingError } = await supabase
        .from('composition_recordings')
        .select(`
          recordings (*)
        `)
        .eq('composition_id', composition.id);

      if (recordingError) throw recordingError;
      setRecordings(recordingData?.map(r => r.recordings) || []);

      // Fetch associated notes
      const { data: noteData, error: noteError } = await supabase
        .from('composition_notes')
        .select(`
          notes (*)
        `)
        .eq('composition_id', composition.id);

      if (noteError) throw noteError;
      setNotes(noteData?.map(n => n.notes) || []);
    } catch (error) {
      console.error('Error fetching associated content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {composition.title}
            </h2>
            <Button variant="secondary" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {composition.description && (
              <div className="prose max-w-none">
                <p className="text-gray-700">{composition.description}</p>
              </div>
            )}

            {/* Recordings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Music className="h-5 w-5 mr-2" />
                Recordings
              </h3>
              {recordings.length > 0 ? (
                <div className="space-y-4">
                  {recordings.map((recording) => (
                    <div key={recording.id} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        {recording.title}
                      </h4>
                      <AudioPlayer
                        audioUrl={recording.audio_url}
                        resourceId={recording.id}
                        resourceType="recording"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No recordings attached</p>
              )}
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Notes
              </h3>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900 mb-2">
                        {note.title}
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No notes attached</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex justify-end">
                <Button
                  onClick={() => onDelete(composition.id)}
                  color="red"
                >
                  Delete Composition
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompositionDetails;