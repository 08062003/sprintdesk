import { create } from 'zustand';
import type { Task, TaskStatus, TaskPriority, User, Comment, Sprint } from '../types';
import { localApi } from '../services/api';

interface BoardState {
  tasks: Task[];
  filteredTasks: Task[];
  users: User[];
  comments: Comment[];
  sprints: Sprint[];
  history: Task[][];
  historyIndex: number;
  filterPriority: TaskPriority | 'all';
  filterAssignee: string | 'all';
  isLoading: boolean;
  
  // Actions
  initializeTasks: () => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  setSprints: (sprints: Sprint[]) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  reorderTask: (taskId: string, newOrder: number) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  
  // Filter actions
  setFilterPriority: (priority: TaskPriority | 'all') => void;
  setFilterAssignee: (assigneeId: string | 'all') => void;
  
  // History actions
  undo: () => void;
  canUndo: boolean;
  
  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
}

// Simulated local storage for board state
const boardStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  }
};

const STORAGE_KEY = 'sprintdesk_board_state';

export const useBoardStore = create<BoardState>((set, get) => ({
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

  initializeTasks: async () => {
    set({ isLoading: true });
    
    try {
      // Try to load from storage first
      const stored = boardStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTasks = JSON.parse(stored);
        // Also fetch users, comments, and sprints
        const [users, comments, sprints] = await Promise.all([
          localApi.getUsers(),
          localApi.getComments(),
          localApi.getSprints()
        ]);
        set({ 
          tasks: parsedTasks, 
          users,
          comments,
          sprints,
          filteredTasks: applyFilters(parsedTasks, get().filterPriority, get().filterAssignee),
          isLoading: false 
        });
        return;
      }
      
      // Fetch from API if no stored data
      const [tasks, users, comments, sprints] = await Promise.all([
        localApi.getTasks(),
        localApi.getUsers(),
        localApi.getComments(),
        localApi.getSprints()
      ]);
      set({ 
        tasks, 
        users,
        comments,
        sprints,
        filteredTasks: applyFilters(tasks, get().filterPriority, get().filterAssignee),
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to initialize tasks:', error);
      set({ isLoading: false });
    }
  },

  setTasks: (tasks) => {
    set({ tasks });
    get().saveToStorage();
  },

  moveTask: (taskId, newStatus, newOrder) => {
    const { tasks, history, historyIndex } = get();
    
    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...tasks]);
    
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          order: newOrder,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    });
    
    // Reorder tasks in the target column
    const columnTasks = updatedTasks.filter(t => t.status === newStatus);
    columnTasks.sort((a, b) => a.order - b.order);
    
    // Update order for all tasks in the column
    const reorderedTasks = updatedTasks.map(task => {
      if (task.status === newStatus) {
        const newIndex = columnTasks.findIndex(t => t.id === task.id);
        return { ...task, order: newIndex };
      }
      return task;
    });
    
    set({
      tasks: reorderedTasks,
      filteredTasks: applyFilters(reorderedTasks, get().filterPriority, get().filterAssignee),
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true
    });
    
    get().saveToStorage();
  },

  reorderTask: (taskId, newOrder) => {
    const { tasks, history, historyIndex } = get();
    
    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...tasks]);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const columnTasks = tasks.filter(t => t.status === task.status);
    const otherTasks = tasks.filter(t => t.status !== task.status);
    
    // Remove task from current position
    const taskIndex = columnTasks.findIndex(t => t.id === taskId);
    const [movedTask] = columnTasks.splice(taskIndex, 1);
    
    // Insert at new position
    columnTasks.splice(newOrder, 0, movedTask);
    
    // Update order for all tasks in the column
    const reorderedColumn = columnTasks.map((t, index) => ({ ...t, order: index, updatedAt: new Date().toISOString() }));
    
    const updatedTasks = [...otherTasks, ...reorderedColumn];
    
    set({
      tasks: updatedTasks,
      filteredTasks: applyFilters(updatedTasks, get().filterPriority, get().filterAssignee),
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true
    });
    
    get().saveToStorage();
  },

  updateTask: (taskId, updates) => {
    const { tasks, history, historyIndex } = get();
    
    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...tasks]);
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    
    set({
      tasks: updatedTasks,
      filteredTasks: applyFilters(updatedTasks, get().filterPriority, get().filterAssignee),
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true
    });
    
    get().saveToStorage();
  },

  addTask: (taskData) => {
    const { tasks, history, historyIndex } = get();
    
    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...tasks]);
    
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedTasks = [...tasks, newTask];
    
    set({
      tasks: updatedTasks,
      filteredTasks: applyFilters(updatedTasks, get().filterPriority, get().filterAssignee),
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true
    });
    
    get().saveToStorage();
  },

  deleteTask: (taskId) => {
    const { tasks, history, historyIndex } = get();
    
    // Save current state to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...tasks]);
    
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    set({
      tasks: updatedTasks,
      filteredTasks: applyFilters(updatedTasks, get().filterPriority, get().filterAssignee),
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true
    });
    
    get().saveToStorage();
  },

  addComment: (_taskId, comment) => {
    const { comments } = get();
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedComments = [...comments, newComment];
    set({ comments: updatedComments });
  },

  setSprints: (sprints: Sprint[]) => {
    set({ sprints });
  },

  setFilterPriority: (priority) => {
    set({ filterPriority: priority });
    const { tasks, filterAssignee } = get();
    set({ filteredTasks: applyFilters(tasks, priority, filterAssignee) });
  },

  setFilterAssignee: (assigneeId) => {
    set({ filterAssignee: assigneeId });
    const { tasks, filterPriority } = get();
    set({ filteredTasks: applyFilters(tasks, filterPriority, assigneeId) });
  },

  undo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      set({
        tasks: previousState,
        filteredTasks: applyFilters(previousState, get().filterPriority, get().filterAssignee),
        historyIndex: historyIndex - 1,
        canUndo: historyIndex - 1 > 0
      });
      get().saveToStorage();
    }
  },

  saveToStorage: () => {
    const { tasks } = get();
    boardStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  loadFromStorage: () => {
    const stored = boardStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const tasks = JSON.parse(stored);
        // Also fetch users, comments, and sprints
        Promise.all([
          localApi.getUsers(),
          localApi.getComments(),
          localApi.getSprints()
        ]).then(([users, comments, sprints]) => {
          set({ 
            tasks, 
            users,
            comments,
            sprints,
            filteredTasks: applyFilters(tasks, get().filterPriority, get().filterAssignee)
          });
        });
      } catch (error) {
        console.error('Failed to load from storage:', error);
      }
    }
  },

  clearStorage: () => {
    boardStorage.removeItem(STORAGE_KEY);
  }
}));

// Helper function to apply filters
function applyFilters(tasks: Task[], priority: TaskPriority | 'all', assigneeId: string | 'all'): Task[] {
  let filtered = tasks;
  
  if (priority !== 'all') {
    filtered = filtered.filter(task => task.priority === priority);
  }
  
  if (assigneeId !== 'all') {
    filtered = filtered.filter(task => task.assigneeId === assigneeId);
  }
  
  return filtered;
}
