import React, { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react';
import { useAudioContext } from '../../contexts/AudioContext';
import { supabase } from '../../services/supabase';
import { Feedback as FeedbackType } from '../../services/supabase'; // Assurez-vous que ce type correspond à votre définition

interface AudioPlayerProps {
  audioUrl: string;
  resourceId: string;
  resourceType: 'note' | 'recording';
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  resourceId,
  resourceType,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { setCurrentTime } = useAudioContext();
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

  useEffect(() => {
    let wsInstance: WaveSurfer | null = null;

    if (waveformRef.current) {
      wsInstance = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4F46E5',
        progressColor: '#818CF8',
        cursorColor: '#F97316',
        barWidth: 1,
        barRadius: 2,
        responsive: true,
        height: 40,
      });

      wavesurfer.current = wsInstance;

      wsInstance.load(audioUrl);

      wsInstance.on('ready', () => {
        const audioDuration = wsInstance?.getDuration() || 0;
        setDuration(audioDuration);
        console.log('Audio loaded, duration:', audioDuration);
      });

      wsInstance.on('finish', () => {
        setIsPlaying(false);
      });

      wsInstance.on('timeupdate', (currentTime) => {
        setCurrentTime(currentTime);
      });
    }

    return () => {
      if (wsInstance) {
        wsInstance.destroy();
      }
    };
  }, [audioUrl, setCurrentTime]);

  useEffect(() => {
    if (resourceId && resourceType) {
      console.log(
        `Fetching feedbacks for ${resourceType} with ID: ${resourceId}`
      );
      fetchFeedbacks();
    }
  }, [resourceId, resourceType]);

  const fetchFeedbacks = async () => {
    try {
      const columnName = resourceType === 'note' ? 'note_id' : 'recording_id';

      console.log('Fetching feedbacks with:', {
        resourceId,
        columnName,
      });

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq(columnName, resourceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching feedbacks:', error);
        return;
      }

      console.log('Fetched feedbacks:', data);
      setFeedbacks(data || []);
    } catch (err) {
      console.error('Exception during fetch:', err);
    }
  };

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const getPointPosition = (timestamp: number) => {
    if (duration === 0) return 0;
    const position = (timestamp / duration) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const seekToFeedback = (timestamp: number) => {
    if (wavesurfer.current && duration > 0) {
      const normalizedTime = Math.min(timestamp / duration, 1);
      wavesurfer.current.seekTo(normalizedTime);
      if (!isPlaying) {
        wavesurfer.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 sm:p-4 w-full">
      <div className="flex items-center mb-2">
        <button
          onClick={togglePlay}
          className="bg-indigo-600 text-white rounded-full p-2 sm:p-3 hover:bg-indigo-700 mr-2 sm:mr-4 flex-shrink-0"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {duration > 0 ? formatTime(duration) : '--:--'}
        </div>
      </div>

      <div className="relative w-full" style={{ minHeight: '40px' }}>
        <div ref={waveformRef} className="w-full" />
      </div>

      {/* Container pour les marqueurs de feedback */}
      <div className="relative w-full h-1 mt-2 mb-2 z-0">
        {/* Rendu des points de feedback */}
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="absolute top-0 cursor-pointer "
            style={{
              left: `${getPointPosition(feedback.timestamp_seconds || 0)}%`,
              transform: 'translateX(-50%)',
            }}
            onClick={() => seekToFeedback(feedback.timestamp_seconds || 0)}
            onMouseEnter={() => setActiveFeedback(feedback.id)}
            onMouseLeave={() => setActiveFeedback(null)}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full flex items-center justify-center"></div>

            {activeFeedback === feedback.id && (
              <div className="absolute top-6 left-0 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap ">
                {feedback.comment ? (
                  <span className="block max-w-xs truncate">
                    {feedback.comment}
                  </span>
                ) : (
                  <span>
                    Feedback à {formatTime(feedback.timestamp_seconds || 0)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feedback count */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {feedbacks.length > 0
          ? `${feedbacks.length} feedback${feedbacks.length > 1 ? 's' : ''}`
          : 'Aucun feedback enregistré'}
      </div>
    </div>
  );
};

export default AudioPlayer;
