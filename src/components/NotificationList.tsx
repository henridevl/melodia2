import React from 'react';

interface Notification {
  id: number;
  message: string;
  read: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onClose,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1">
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close notifications"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {notifications.length === 0 ? (
          <p className="px-4 py-2 text-sm text-gray-500">
            Pas de nouvelles notifications
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-2 text-sm ${
                notification.read
                  ? 'text-gray-700'
                  : 'text-indigo-600 font-medium'
              }`}
            >
              {notification.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
