// components/form/CompositionViewer.tsx
import React from 'react';
import { Music, FileText } from 'lucide-react';
import AudioPlayer from '../recordings/AudioPlayer';
import FeedbackComponent from '../feedback/FeedbackComponent';

interface CompositionViewerProps {
  title: string;
  description: string;
  tags: string[];
  recordings: any[];
  notes: any[];
  compositionId?: string;
  userId: string;
  onFeedbackAdded: () => void;
  feedbacks: any[];
}

const CompositionViewer: React.FC<CompositionViewerProps> = ({
  title,
  description,
  tags,
  recordings,
  notes,
  compositionId,
  userId,
  onFeedbackAdded,
  feedbacks
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <div className="mt-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
      </div>
{/* 
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {recordings.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recordings</h3>
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="bg-gray-50 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center mb-2">
                    <Music className="h-5 w-5 text-indigo-500 mr-2" />
                    <h4 className="text-lg font-medium text-gray-900">
                      {recording.title}
                    </h4>
                  </div>
                  <AudioPlayer
                    audioUrl={recording.audio_url}
                    resourceId={recording.id}
                    resourceType="recording"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gray-50 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="text-lg font-medium text-gray-900">
                      {note.title}
                    </h4>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
      </div>
      */}
    </div>
  );
};

export default CompositionViewer;
