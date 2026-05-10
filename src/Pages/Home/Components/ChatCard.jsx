import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";

export default function ChartCard({
  title,
  icon,
  data,
  type = "area",       
  color = "#FFA500",
  yDomain = [0, 1000],
  yTicks = [],
  barSize = 40,
}) {
  return (
    <div className="container mx-auto px-6 bg-white my-10 py-8 rounded-3xl">
      
      <div className="flex gap-1.5 justify-end items-center mb-3.5">
        <h2 className="font-bold">{title}</h2>
        {icon && <img src={icon} className="w-[24px] h-[18px]" alt={title} />}
      </div>

      <div style={{ width: "100%", height: 290 }}>
        <ResponsiveContainer>
          {type === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis domain={yDomain} ticks={yTicks} />
              <Tooltip />
              {yTicks.map((y) => (
                <ReferenceLine key={y} y={y} stroke="black" strokeWidth={2} />
              ))}
              <Area type="linear" dataKey="visitors" stroke="none" fill="rgba(250, 220, 180, 1)" />
              <Line type="linear" dataKey="visitors" stroke={color} strokeWidth={3} dot={{ r: 5, fill: color, stroke: color }} />
            </AreaChart>
          ) : (
            <BarChart data={data} barSize={barSize}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis domain={yDomain} ticks={yTicks} />
              <Tooltip />
              {yTicks.map((y) => (
                <ReferenceLine key={y} y={y} stroke="black" strokeWidth={2} />
              ))}
              <Bar dataKey="visitors" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
