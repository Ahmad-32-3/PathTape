import { useEffect, useRef, useState } from 'react'
import { DATA } from '../../data'

type Counter = {
  key: string
  value: number
  unit?: string
  label: string
  note: string
  decimals: number
}

const COUNTERS: Counter[] = [
  {
    key: 'win',
    value: DATA.success_pct,
    unit: '%',
    label: 'paths where the balanced score wins',
    note: `J_ac <= J_twap - ${DATA.eps}, ${DATA.n_win} of ${DATA.n_paths}`,
    decimals: 1,
  },
  {
    key: 'jac',
    value: DATA.mean_j_ac,
    label: 'mean cost+risk, balanced',
    note: 'implementation shortfall plus leftover-inventory risk',
    decimals: 3,
  },
  {
    key: 'jtw',
    value: DATA.mean_j_twap,
    label: 'mean cost+risk, even slices',
    note: 'same paths, same horizon, equal slice each bin',
    decimals: 3,
  },
  {
    key: 'first',
    value: DATA.first_share_ac,
    unit: '%',
    label: 'sold in the first slice',
    note: `even slices sell ${DATA.first_share_twap}% in that same first bin`,
    decimals: 1,
  },
]

function Cell({ c }: { c: Counter }) {
  const [shown, setShown] = useState(c.value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (!el || reduce) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const dur = 900
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / dur)
          const eased = 1 - (1 - p) ** 3
          setShown(c.value * eased)
          if (p < 1) requestAnimationFrame(tick)
          else setShown(c.value)
        }
        setShown(0)
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [c.value])

  return (
    <div className="bento__cell" ref={ref}>
      <div className="bento__value">
        {shown.toFixed(c.decimals)}
        {c.unit ? <span className="bento__unit"> {c.unit}</span> : null}
      </div>
      <div className="bento__label">{c.label}</div>
      <div className="bento__note">{c.note}</div>
    </div>
  )
}

export function ResultBento() {
  return (
    <div className="bento" role="group" aria-label="Almgren-Chriss versus TWAP on the locked protocol">
      {COUNTERS.map((c) => (
        <Cell key={c.key} c={c} />
      ))}
    </div>
  )
}
