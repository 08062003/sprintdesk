import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TaskStatus, Task } from '../types';
import TaskCard from './TaskCard';

interface BoardColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Array<Task & { assigneeName?: string; assigneeAvatar?: string }>;
  onTaskClick: (taskId: string) => void;
}

function BoardColumn({ id, title, tasks, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="bg-gray-100 rounded-lg p-4 min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={`space-y-3 transition-colors ${isOver ? 'bg-gray-200 rounded-lg p-2' : ''}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assigneeName={task.assigneeName}
              assigneeAvatar={task.assigneeAvatar}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default memo(BoardColumn);
