import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '../store/boardStore';

// Helper to reset store state
function resetBoardStore() {
  useBoardStore.setState({
    tasks: [],
    filteredTasks: [],
    users: [],
    comments: [],
    sprints: [],
    history: [],
    historyIndex: -1,
    filterPriority: 'all',
    filterAssignee: 'all',
    isLoading: false,
    canUndo: false,
  });
}

describe('board store', () => {
  beforeEach(() => {
    resetBoardStore();
  });

  it('adds a task', () => {
    const addTask = useBoardStore.getState().addTask;

    addTask({
      title: 'Test Task',
      description: 'A test',
      priority: 'medium',
      assigneeId: '1',
      dueDate: new Date().toISOString(),
      sprintId: 's1',
      status: 'backlog',
      order: 0,
    });

    const tasks = useBoardStore.getState().tasks;
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Test Task');
  });

  it('moves a task across columns and updates order', () => {
    const addTask = useBoardStore.getState().addTask;
    const moveTask = useBoardStore.getState().moveTask;

    addTask({
      title: 'Task A',
      description: '',
      priority: 'low',
      assigneeId: '1',
      dueDate: new Date().toISOString(),
      sprintId: 's1',
      status: 'backlog',
      order: 0,
    });

    const task = useBoardStore.getState().tasks[0];
    moveTask(task.id, 'in-progress', 0);

    const updated = useBoardStore.getState().tasks.find(t => t.id === task.id);
    expect(updated).toBeDefined();
    expect(updated?.status).toBe('in-progress');
    expect(updated?.order).toBe(0);
  });

  it('deletes a task', () => {
    const addTask = useBoardStore.getState().addTask;
    const deleteTask = useBoardStore.getState().deleteTask;

    addTask({
      title: 'To Delete',
      description: '',
      priority: 'low',
      assigneeId: '1',
      dueDate: new Date().toISOString(),
      sprintId: 's1',
      status: 'backlog',
      order: 0,
    });

    const task = useBoardStore.getState().tasks[0];
    expect(useBoardStore.getState().tasks.length).toBe(1);

    deleteTask(task.id);
    expect(useBoardStore.getState().tasks.length).toBe(0);
  });
});
