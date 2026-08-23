import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SprintVelocityChartProps {
  data: Array<{ name: string; completed: number; total: number }>;
}

function SprintVelocityChart({ data }: SprintVelocityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} minWidth={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="completed" fill="#10B981" name="Completed" />
        <Bar dataKey="total" fill="#3B82F6" name="Total" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(SprintVelocityChart);
