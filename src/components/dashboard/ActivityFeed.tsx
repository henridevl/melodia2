import React from 'react';
import Card from '../ui/Card';

interface Activity {
  id: number;
  activity_type: string;
  description: string;
  created_at: string;
  title?: string;
  content?: string;
  audio_url?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onActivityClick,
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <div className="mt-6">
          {activities.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No recent activity
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="py-4 cursor-pointer"
                  onClick={() => onActivityClick(activity)}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-indigo-600 truncate">
                      {activity.activity_type}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActivityFeed;
