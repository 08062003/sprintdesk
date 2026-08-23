import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { exportAsPNG } from '../utils/exportUtils';
import AnalyticsFilterBar from '../components/AnalyticsFilterBar';
import SprintVelocityChart from '../components/charts/SprintVelocityChart';
import StatusDistributionChart from '../components/charts/StatusDistributionChart';
import PriorityBreakdownChart from '../components/charts/PriorityBreakdownChart';
import CompletionTrendChart from '../components/charts/CompletionTrendChart';
import { NotificationBell } from '../components/NotificationBell';

export default function Analytics() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { sprints, isLoading } = useBoardStore();
  
  const [sprintFilter, setSprintFilter] = useState('all');
  
  const analyticsData = useAnalyticsData(sprintFilter, sprints);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleExport = () => {
    exportAsPNG('analytics-content', `sprintdesk-analytics-${new Date().toISOString().split('T')[0]}.png`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">SprintDesk</h1>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/board')}
                className="text-gray-600 hover:text-gray-900"
              >
                Board
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-2">
                {user?.image && (
                  <img
                    src={user.image}
                    alt={user.username}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-gray-700">{user?.username || user?.firstName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Track your sprint progress and team performance</p>
        </div>

        <AnalyticsFilterBar
          sprintFilter={sprintFilter}
          sprints={sprints}
          onSprintChange={setSprintFilter}
          onExport={handleExport}
        />

        <div id="analytics-content" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow animate-fade-in">
              <h3 className="text-xs font-medium text-gray-500 mb-1">Total Tasks</h3>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalTasks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xs font-medium text-gray-500 mb-1">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{analyticsData.completedTasks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xs font-medium text-gray-500 mb-1">In Progress</h3>
              <p className="text-2xl font-bold text-yellow-600">{analyticsData.inProgressTasks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-xs font-medium text-gray-500 mb-1">Completion Rate</h3>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.overallCompletionRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Sprint Velocity</h3>
              <SprintVelocityChart data={analyticsData.sprintVelocity} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
              <StatusDistributionChart data={analyticsData.statusDistribution} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Priority Breakdown by Status</h3>
            <PriorityBreakdownChart data={analyticsData.priorityBreakdown} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Completion Trend</h3>
            {analyticsData.completionTrend.length > 0 ? (
              <CompletionTrendChart data={analyticsData.completionTrend} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No completion data available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
