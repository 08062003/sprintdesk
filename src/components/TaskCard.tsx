import { memo, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  assigneeName?: string;
  assigneeAvatar?: string;
  onClick: () => void;
}

function TaskCard({ task, assigneeName, assigneeAvatar, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }), [transform, transition, isDragging]);

  const getPriorityColor = useMemo(() => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, [task.priority]);

  const isOverdue = useMemo(() => new Date(task.dueDate) < new Date() && task.status !== 'done', [task.dueDate, task.status]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">{task.title}</h4>
        <span
          className={`ml-2 px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor}`}
        >
          {task.priority}
        </span>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          {assigneeAvatar ? (
            <img
              src={assigneeAvatar}
              alt={assigneeName}
              className="h-6 w-6 rounded-full"
              title={assigneeName}
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">
                {assigneeName?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-600 truncate max-w-[100px]">{assigneeName}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <svg
            className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(TaskCard);
