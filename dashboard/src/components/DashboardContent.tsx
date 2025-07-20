'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Calendar, Users, Activity } from 'lucide-react';

export const DashboardContent = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your dashboard today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Events
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.role === 'admin' && (
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Events
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            No recent activity to display.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};