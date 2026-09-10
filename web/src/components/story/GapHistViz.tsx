import { DATA } from '../../data'

const W = 660
const H = 260
const PAD = { l: 44, r: 16, t: 12, b: 40 }

export function GapHistViz() {
  const counts = DATA.gap_counts
  const edges = DATA.gap_edges
  const maxC = Math.max(...counts)
  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const n = counts.length
  const bw = plotW / n
  const xAt = (v: number) => {
    const lo = edges[0]
    const hi = edges[edges.length - 1]
    return PAD.l + ((v - lo) / (hi - lo)) * plotW
  }
  const epsX = xAt(DATA.eps)

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`How much better the balanced score is than even slices, across ${DATA.n_paths} paths. A path counts as a win when the gap is at least ${DATA.eps}.`}
      >
        {counts.map((c, i) => {
          const h = (c / maxC) * plotH
          const mid = (edges[i] + edges[i + 1]) / 2
          const win = mid >= DATA.eps
          return (
            <rect
              key={i}
              className="bar-grow"
              x={PAD.l + i * bw + 1}
              y={PAD.t + plotH - h}
              width={bw - 2}
              height={h}
              fill={win ? 'var(--good)' : 'var(--bad)'}
              opacity={0.85}
              style={{ animationDelay: `${i * 40}ms` }}
            />
          )
        })}
        <line x1={epsX} x2={epsX} y1={PAD.t} y2={PAD.t + plotH} stroke="var(--fg-hi)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={epsX + 6} y={PAD.t + 12} fontSize="11" fill="var(--fg-hi)" fontFamily="var(--font-mono)">
          win line {DATA.eps}
        </text>
        <text x={PAD.l} y={H - 8} fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          TWAP better
        </text>
        <text x={W - PAD.r} y={H - 8} textAnchor="end" fontSize="11" fill="var(--chart-label)" fontFamily="var(--font-mono)">
          balanced better
        </text>
      </svg>
    </div>
  )
}
