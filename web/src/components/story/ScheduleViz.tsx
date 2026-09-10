import { DATA } from '../../data'

type Series = { label: string; color: string; values: readonly number[]; dash?: string; width?: number }

const W = 660
const H = 280
const PAD = { l: 44, r: 16, t: 16, b: 36 }

export function ScheduleViz() {
  const series: Series[] = [
    { label: 'dump it now', color: 'var(--bad)', values: DATA.x_dump, dash: '3 4' },
    { label: 'dribble evenly (TWAP)', color: 'var(--amber)', values: DATA.x_twap, dash: '7 4' },
    { label: 'balance impact and risk', color: 'var(--good)', values: DATA.x_ac, width: 2.4 },
  ]
  const t = DATA.t
  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const x = (i: number) => PAD.l + (i / (t.length - 1)) * plotW
  const y = (v: number) => PAD.t + plotH - v * plotH
  const path = (vals: readonly number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Remaining inventory over the session. Dump drops to zero at the first slice. Even slices fall in a straight line. The balanced schedule sells more up front, then tails off."
      >
        {[0, 0.5, 1].map((tick) => (
          <g key={tick}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(tick)} y2={y(tick)} stroke="var(--chart-grid)" strokeWidth="1" />
            <text x={PAD.l - 6} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
              {tick === 0 ? '0' : tick === 1 ? 'all' : 'half'}
            </text>
          </g>
        ))}
        <text x={PAD.l} y={H - 8} fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          open
        </text>
        <text x={W - PAD.r} y={H - 8} textAnchor="end" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          close
        </text>
        {series.map((s) => (
          <path
            key={s.label}
            className="draw-line"
            d={path(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width ?? 2}
            strokeDasharray={s.dash}
            strokeLinejoin="round"
            pathLength={1}
          />
        ))}
      </svg>
      <ul className="legend">
        {series.map((s) => (
          <li key={s.label}>
            <svg width="26" height="10" aria-hidden="true" style={{ flex: '0 0 auto' }}>
              <line x1="1" y1="5" x2="25" y2="5" stroke={s.color} strokeWidth={2} strokeDasharray={s.dash} />
            </svg>
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
