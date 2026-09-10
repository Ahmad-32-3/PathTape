type Tool = {
  name: string
  tag: string
  plain: string
  tech: string
}

const TOOLS: Tool[] = [
  {
    name: 'numpy',
    tag: 'math',
    plain: 'Does the schedule math and the 500 price paths in arrays, not in a loop I have to babysit.',
    tech: 'Closed-form discrete Almgren-Chriss holdings, vectorized temporary plus permanent impact, one Gaussian draw per bin per path.',
  },
  {
    name: 'pytest',
    tag: 'check',
    plain: 'The tests that must go red if I cheat: wrong length, leftover shares, or a schedule that peeked at future prices.',
    tech: 'Injection checks raise ValueError on a truncated path, a non-conserving trade list, and a trade list that moved with shuffled future prices.',
  },
  {
    name: 'Synthetic AC market',
    tag: 'data',
    plain: 'I do not need a live broker. I make a market where dumping moves the price, and leftover size still sits in the noise.',
    tech: 'η temporary, γ permanent, σ shock per bin. T=64, N=500, caps equal the run. Over-cap is a hard fail.',
  },
  {
    name: 'Vite + React + Tailwind',
    tag: 'page',
    plain: 'The walkthrough you are reading. Numbers come from a static file, not from a server.',
    tech: 'Vite build, React 19, Tailwind v4. Charts are hand SVG on the chb-mit-eeg tokens. No HTTP.',
  },
]

export function StackGrid() {
  return (
    <ul className="stack-grid">
      {TOOLS.map((t) => (
        <li key={t.name} className="stack-tool">
          <div className="stack-tool__head">
            <span className="stack-tool__name">{t.name}</span>
            <span className="stack-tool__tag">{t.tag}</span>
          </div>
          <p className="stack-tool__plain">{t.plain}</p>
          <p className="stack-tool__tech">{t.tech}</p>
        </li>
      ))}
    </ul>
  )
}
