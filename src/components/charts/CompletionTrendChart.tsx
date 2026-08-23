import { memo, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CompletionTrendChartProps {
  data: Array<{ date: string; completed: number }>;
}

function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  // Format date for display
  const formattedData = useMemo(() => data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })), [data]);

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={300}>
      <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line 
          type="monotone" 
          dataKey="completed" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ fill: '#3B82F6' }}
          name="Cumulative Completions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default memo(CompletionTrendChart);
