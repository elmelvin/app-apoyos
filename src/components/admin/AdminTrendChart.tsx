import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface AdminTrendPoint {
  day: string;
  total: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
}

interface AdminTrendChartProps {
  data: AdminTrendPoint[];
}

const AdminTrendChart = ({ data }: AdminTrendChartProps) => {
  return (
    <div className="admin-trend-chart">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="adminPendingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.26} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.04} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#d7e1da" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="aprobados" fill="#2f855a" radius={[6, 6, 0, 0]} name="Aprobadas" />
          <Bar dataKey="rechazados" fill="#dc2626" radius={[6, 6, 0, 0]} name="Rechazadas" />
          <Area
            type="monotone"
            dataKey="pendientes"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#adminPendingFill)"
            name="Pendientes"
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#155eef"
            strokeWidth={3}
            dot={{ r: 3 }}
            name="Total"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminTrendChart;
