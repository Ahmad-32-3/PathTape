import { DATA } from '../../data'

const W = 660
const H = 220
const PAD = { l: 48, r: 16, t: 16, b: 36 }

export function AblationViz() {
  const rows = DATA.ablation.filter((r) => r.knob.startsWith('risk'))
  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const n = rows.length
  const bw = plotW / n

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Win rate against even slices as I turn up care about leftover risk. Low care looks closer to even slices. The locked setting clears 90 percent."
      >
        {[0, 50, 85, 100].map((tick) => {
          const y = PAD.t + plotH - (tick / 100) * plotH
          return (
            <g key={tick}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="var(--chart-grid)" strokeWidth="1" />
              <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
                {tick}
              </text>
            </g>
          )
        })}
        {rows.map((r, i) => {
          const h = (r.success_pct / 100) * plotH
          const locked = r.value === DATA.lam
          return (
            <g key={r.value}>
              <rect
                className="bar-grow"
                x={PAD.l + i * bw + bw * 0.22}
                y={PAD.t + plotH - h}
                width={bw * 0.56}
                height={h}
                fill={locked ? 'var(--good)' : 'var(--accent)'}
                style={{ animationDelay: `${i * 80}ms` }}
              />
              <text
                x={PAD.l + i * bw + bw / 2}
                y={H - 10}
                textAnchor="middle"
                fontSize="11"
                fill="var(--chart-label)"
                fontFamily="var(--font-mono)"
              >
                {locked ? 'locked' : `lambda ${r.value}`}
              </text>
            </g>
          )
        })}
      </svg>
      <ul className="legend">
        <li>How often the balanced score beats even slices, as leftover-risk care goes up.</li>
      </ul>
    </div>
  )
}
