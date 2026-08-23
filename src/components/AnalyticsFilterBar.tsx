import type { Sprint } from '../types';

interface AnalyticsFilterBarProps {
  sprintFilter: string;
  sprints: Sprint[];
  onSprintChange: (sprintId: string) => void;
  onExport: () => void;
}

export default function AnalyticsFilterBar({
  sprintFilter,
  sprints,
  onSprintChange,
  onExport,
}: AnalyticsFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="sprint-filter" className="text-sm font-medium text-gray-700">
            Sprint:
          </label>
          <select
            id="sprint-filter"
            value={sprintFilter}
            onChange={(e) => onSprintChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
          >
            <option value="all">All Sprints</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({sprint.startDate} - {sprint.endDate})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        <button
          onClick={onExport}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span className="text-sm font-medium">Export as PNG</span>
        </button>
      </div>
    </div>
  );
}
