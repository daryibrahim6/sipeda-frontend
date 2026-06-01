type Slice = { label: string; value: number; color: string };
type Props = { data: Slice[]; size?: number; thickness?: number };

export function DonutChart({ data, size = 160, thickness = 32 }: Props) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = cx - thickness / 2;

  const arcs = data.map((d, i) => {
    const cumulative = data.slice(0, i).reduce((a, b) => a + b.value, 0);
    const angle = (d.value / total) * 360;
    const startAngle = (cumulative / total) * 360;
    return { ...d, startAngle, angle };
  });

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(startAngle: number, endAngle: number) {
    if (endAngle - startAngle >= 360) {
      const p1 = polarToCartesian(cx, cy, r, startAngle);
      const p2 = polarToCartesian(cx, cy, r, startAngle + 359.9);
      const mid = polarToCartesian(cx, cy, r, startAngle + 179.95);
      return [
        `M ${p1.x} ${p1.y}`,
        `A ${r} ${r} 0 1 1 ${p2.x} ${p2.y}`,
        `M ${mid.x} ${mid.y}`,
      ].join(' ');
    }
    if (endAngle - startAngle <= 0) return '';
    const p1 = polarToCartesian(cx, cy, r, startAngle);
    const p2 = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${p1.x} ${p1.y}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    ].join(' ');
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDE9E3" strokeWidth={thickness} />
        {/* Slices */}
        {arcs.map((d, i) => {
          if (d.angle <= 0) return null;
          const path = describeArc(d.startAngle, d.startAngle + d.angle);
          if (!path) return null;
          return (
            <path key={i} d={path} fill="none" stroke={d.color} strokeWidth={thickness} strokeLinecap="round">
              <title>{d.label}: {d.value} ({Math.round((d.value / total) * 100)}%)</title>
            </path>
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-[#1A1410]" fontSize={28} fontWeight={800}>
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-[#6B6258]" fontSize={10}>
          Total
        </text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-[var(--color-text-secondary)]">{d.label}</span>
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
