import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import Card from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  loading = false,
}) => {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-5">
            <div className="text-sm font-medium text-gray-500">{title}</div>
            {loading ? (
              <div className="mt-1 h-8 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;