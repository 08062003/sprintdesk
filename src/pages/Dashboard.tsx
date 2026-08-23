import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import { NotificationBell } from '../components/NotificationBell';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Dashboard() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { tasks, sprints } = useBoardStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get active sprint
  const activeSprint = sprints.find(s => s.status === 'active') || sprints[sprints.length - 1];
  const sprintTasks = tasks.filter(t => t.sprintId === activeSprint?.id);
  const completedSprintTasks = sprintTasks.filter(t => t.status === 'done');
  const sprintProgress = sprintTasks.length > 0 ? (completedSprintTasks.length / sprintTasks.length) * 100 : 0;

  // Recent activity (simulate from task updates)
  const recentActivity = [
    { id: 1, action: 'Task completed', task: 'Set up project infrastructure', time: '2 hours ago', user: 'Emily Johnson' },
    { id: 2, action: 'Task moved', task: 'Implement advanced drag and drop', time: '4 hours ago', user: 'Michael Williams' },
    { id: 3, action: 'Comment added', task: 'Design authentication flow', time: '6 hours ago', user: 'Sarah Brown' },
    { id: 4, action: 'Task created', task: 'Add keyboard shortcuts', time: '1 day ago', user: 'David Miller' },
    { id: 5, action: 'Sprint started', task: 'Sprint 3', time: '2 days ago', user: 'System' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SprintDesk</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <NotificationBell />
              <div className="flex items-center space-x-2">
                {user?.image && (
                  <img
                    src={user.image}
                    alt={user.username}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-gray-700 dark:text-gray-300">{user?.username || user?.firstName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Welcome to SprintDesk</p>
        </div>

        {/* Active Sprint Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Sprint</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeSprint?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {activeSprint?.status === 'active' ? 'In Progress' : 'Completed'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sprint Name</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{activeSprint?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {activeSprint?.startDate} - {activeSprint?.endDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${sprintProgress}%` }}
                  />
                </div>
                <span className="text-lg font-medium text-gray-900 dark:text-white">{sprintProgress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Tasks</h3>
            <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'in-progress').length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.status === 'done').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/board')}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <span className="font-medium text-gray-900 dark:text-white">Go to Task Board</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your tasks</p>
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <span className="font-medium text-gray-900 dark:text-white">View Analytics</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">See sprint progress and metrics</p>
              </button>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {activity.task}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {activity.time} • {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
