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

interface PriorityBreakdownChartProps {
  data: Array<{ name: string; high: number; medium: number; low: number }>;
}

function PriorityBreakdownChart({ data }: PriorityBreakdownChartProps) {
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
        <Bar dataKey="high" stackId="a" fill="#EF4444" name="High" />
        <Bar dataKey="medium" stackId="a" fill="#F59E0B" name="Medium" />
        <Bar dataKey="low" stackId="a" fill="#10B981" name="Low" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(PriorityBreakdownChart);
