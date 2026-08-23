import { useEffect, useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import type { TaskStatus, Task } from '../types';
import BoardColumn from '../components/BoardColumn';
import FilterBar from '../components/FilterBar';
import TaskDrawer from '../components/TaskDrawer';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import { NotificationBell } from '../components/NotificationBell';

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export default function Board() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const {
    tasks,
    filteredTasks,
    users,
    comments,
    sprints,
    isLoading,
    filterPriority,
    filterAssignee,
    canUndo,
    initializeTasks,
    moveTask,
    reorderTask,
    updateTask,
    addTask,
    deleteTask,
    addComment,
    setFilterPriority,
    setFilterAssignee,
    undo,
  } = useBoardStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    initializeTasks();
  }, [initializeTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping on a column
    const column = columns.find(col => col.id === overId);
    if (column) {
      if (activeTask.status !== column.id) {
        // Move to different column
        const columnTasks = filteredTasks.filter(t => t.status === column.id);
        moveTask(activeId, column.id, columnTasks.length);
      }
      return;
    }

    // Check if dropping on another task (reorder within same column)
    const overTask = tasks.find(t => t.id === overId);
    if (overTask && activeTask.status === overTask.status) {
      const columnTasks = tasks.filter(t => t.status === activeTask.status);
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);
      
      if (oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        reordered.forEach((task, index) => {
          if (task.id === activeId) {
            reorderTask(activeId, index);
          }
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTasksByStatus = (status: TaskStatus) => {
    const columnTasks = filteredTasks.filter(task => task.status === status);
    return columnTasks.map(task => {
      const assignee = users.find(u => u.id === task.assigneeId);
      return {
        ...task,
        assigneeName: assignee?.name,
        assigneeAvatar: assignee?.avatar,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

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
                onClick={() => navigate('/analytics')}
                className="text-gray-600 hover:text-gray-900"
              >
                Analytics
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
            <p className="text-gray-600">Drag and drop tasks to update their status</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create New Task
          </button>
        </div>

        <FilterBar
          filterPriority={filterPriority}
          filterAssignee={filterAssignee}
          users={users}
          onPriorityChange={setFilterPriority}
          onAssigneeChange={setFilterAssignee}
          onUndo={undo}
          canUndo={canUndo}
        />

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <BoardColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={getTasksByStatus(column.id)}
                onTaskClick={(taskId) => setSelectedTask(filteredTasks.find(t => t.id === taskId) || null)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-90">
                <TaskCard
                  task={activeTask}
                  assigneeName={users.find(u => u.id === activeTask.assigneeId)?.name}
                  assigneeAvatar={users.find(u => u.id === activeTask.assigneeId)?.avatar}
                  onClick={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDrawer
        task={selectedTask}
        users={users}
        comments={comments}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={updateTask}
        onAddComment={addComment}
        onDeleteTask={deleteTask}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users}
        sprints={sprints}
        onCreateTask={addTask}
      />
    </div>
  );
}
