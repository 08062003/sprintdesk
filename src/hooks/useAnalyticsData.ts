import { useMemo } from 'react';
import { useBoardStore } from '../store/boardStore';
import type { Task } from '../types';

interface AnalyticsData {
  sprintVelocity: Array<{ name: string; completed: number; total: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  priorityBreakdown: Array<{ name: string; high: number; medium: number; low: number }>;
  completionTrend: Array<{ date: string; completed: number }>;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overallCompletionRate: number;
}

const STATUS_COLORS = {
  'backlog': '#9CA3AF',
  'in-progress': '#F59E0B',
  'review': '#8B5CF6',
  'done': '#10B981',
};

export function useAnalyticsData(sprintFilter: string = 'all', sprints: any[] = []): AnalyticsData {
  const { tasks } = useBoardStore();

  return useMemo(() => {
    // Filter tasks by sprint if specified
    const filteredTasks = sprintFilter === 'all' 
      ? tasks 
      : tasks.filter(task => task.sprintId === sprintFilter);

    // Sprint Velocity Chart Data
    const sprintVelocity = sprints.map((sprint: any) => {
      const sprintTasks = filteredTasks.filter(task => task.sprintId === sprint.id);
      const completedTasks = sprintTasks.filter(task => task.status === 'done').length;
      return {
        name: sprint.name,
        completed: completedTasks,
        total: sprintTasks.length,
      };
    });

    // Task Status Distribution
    const statusCounts = {
      'backlog': filteredTasks.filter(t => t.status === 'backlog').length,
      'in-progress': filteredTasks.filter(t => t.status === 'in-progress').length,
      'review': filteredTasks.filter(t => t.status === 'review').length,
      'done': filteredTasks.filter(t => t.status === 'done').length,
    };

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS],
    })).filter(item => item.value > 0);

    // Priority Breakdown by Status
    const priorityBreakdown = ['backlog', 'in-progress', 'review', 'done'].map(status => {
      const statusTasks = filteredTasks.filter(t => t.status === status);
      return {
        name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
        high: statusTasks.filter(t => t.priority === 'high').length,
        medium: statusTasks.filter(t => t.priority === 'medium').length,
        low: statusTasks.filter(t => t.priority === 'low').length,
      };
    });

    // Completion Trend over time
    const completionTrend = generateCompletionTrend(filteredTasks);

    // Summary metrics
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length;
    const overallCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      sprintVelocity,
      statusDistribution,
      priorityBreakdown,
      completionTrend,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overallCompletionRate,
    };
  }, [tasks, sprints, sprintFilter]);
}

function generateCompletionTrend(tasks: Task[]): Array<{ date: string; completed: number }> {
  // Group completions by date
  const completionsByDate = new Map<string, number>();
  
  tasks
    .filter(task => task.status === 'done' && task.completedAt)
    .forEach(task => {
      const date = task.completedAt!.split('T')[0];
      completionsByDate.set(date, (completionsByDate.get(date) || 0) + 1);
    });

  // Convert to array and sort by date
  const trend = Array.from(completionsByDate.entries())
    .map(([date, completed]) => ({ date, completed }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // If no data, return empty array
  if (trend.length === 0) {
    return [];
  }

  // Fill in missing dates with cumulative completions
  const filledTrend: Array<{ date: string; completed: number }> = [];
  let cumulative = 0;
  
  const startDate = new Date(trend[0].date);
  const endDate = new Date(trend[trend.length - 1].date);
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayCompletions = completionsByDate.get(dateStr) || 0;
    cumulative += dayCompletions;
    filledTrend.push({ date: dateStr, completed: cumulative });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filledTrend;
}
