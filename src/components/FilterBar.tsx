import type { TaskPriority, User } from '../types';
import { Button } from './ui/Button';

interface FilterBarProps {
  filterPriority: TaskPriority | 'all';
  filterAssignee: string | 'all';
  users: User[];
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  onAssigneeChange: (assigneeId: string | 'all') => void;
  onUndo: () => void;
  canUndo: boolean;
}

export default function FilterBar({
  filterPriority,
  filterAssignee,
  users,
  onPriorityChange,
  onAssigneeChange,
  onUndo,
  canUndo,
}: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="priority-filter" className="text-sm font-medium text-gray-700">
            Priority:
          </label>
          <select
            id="priority-filter"
            value={filterPriority}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="assignee-filter" className="text-sm font-medium text-gray-700">
            Assignee:
          </label>
          <select
            id="assignee-filter"
            value={filterAssignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="outline"
          size="sm"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
          Undo
        </Button>
      </div>
    </div>
  );
}
