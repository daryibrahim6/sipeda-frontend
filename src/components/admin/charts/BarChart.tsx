type Bar = { label: string; value: number; color: string };
type Props = { data: Bar[]; height?: number; showValues?: boolean };

export function BarChart({ data, height = 200, showValues = true }: Props) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(20, Math.min(60, 600 / data.length - 4));

  return (
    <svg viewBox={`0 0 ${data.length * (barWidth + 4) + 40} ${height + 40}`} className="w-full h-auto">
      {/* Y axis line */}
      <line x1={30} y1={10} x2={30} y2={height + 10} stroke="#D6D0C6" strokeWidth={1} />
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = height + 10 - r * height;
        return (
          <g key={r}>
            <line x1={30} y1={y} x2={data.length * (barWidth + 4) + 35} y2={y} stroke="#EDE9E3" strokeWidth={1} />
            <text x={28} y={y + 4} textAnchor="end" className="fill-[#9C9488]" fontSize={10}>
              {Math.round(r * max)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / max) * height;
        const x = 35 + i * (barWidth + 4);
        const y = height + 10 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} rx={4} fill={d.color} className="transition-all duration-500">
              <title>{d.label}: {d.value}</title>
            </rect>
            {showValues && d.value > 0 && (
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="fill-[#1A1410]" fontSize={11} fontWeight={600}>
                {d.value}
              </text>
            )}
            <text x={x + barWidth / 2} y={height + 24} textAnchor="middle" className="fill-[#6B6258]" fontSize={9}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
