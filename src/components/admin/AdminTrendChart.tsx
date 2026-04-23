import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface AdminTrendPoint {
  day: string;
  total: number;
  pendientes: number;
}

interface AdminTrendChartProps {
  data: AdminTrendPoint[];
}

const AdminTrendChart = ({ data }: AdminTrendChartProps) => {
  return (
    <div className="admin-trend-chart">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="adminTotalFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2f855a" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#2f855a" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="adminPendingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.26} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.04} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#d7e1da" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#2f855a"
            strokeWidth={3}
            fill="url(#adminTotalFill)"
            name="Solicitudes"
          />
          <Area
            type="monotone"
            dataKey="pendientes"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#adminPendingFill)"
            name="Pendientes"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminTrendChart;
