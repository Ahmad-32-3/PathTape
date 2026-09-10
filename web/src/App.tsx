import { AblationViz } from './components/story/AblationViz'
import { GapHistViz } from './components/story/GapHistViz'
import { ResultBento } from './components/story/ResultBento'
import { ScheduleViz } from './components/story/ScheduleViz'
import { StackGrid } from './components/story/StackGrid'
import { StoryBeat } from './components/story/StoryBeat'
import { DATA } from './data'

const TOC = [
  { href: '#problem', label: 'The problem' },
  { href: '#answer', label: 'The approach' },
  { href: '#result', label: 'The result' },
  { href: '#stack', label: 'Tech stack' },
  { href: '#decisions', label: 'Design choices' },
  { href: '#use', label: 'What is next' },
]

export function App() {
  return (
    <>
      <a className="skip-link" href="#problem">
        Skip to the walkthrough
      </a>

      <div className="masthead">
        <div className="masthead__inner">
          <div className="masthead__mark">
            <b>PathTape</b> · dump vs dribble, scored against even slices
          </div>
          <ul className="masthead__nav">
            <li>
              <a href="#problem">problem</a>
            </li>
            <li>
              <a href="#result">result</a>
            </li>
            <li>
              <a href="#decisions">decisions</a>
            </li>
            <li>
              <a href="#use">next</a>
            </li>
          </ul>
        </div>
      </div>

      <main className="page">
        <header className="page-hero">
          <p className="meta">A walkthrough · selling a large block without dumping it or dribbling it forever</p>
          <h1>PathTape</h1>
          <p className="lead">
            I need to sell a large block over a session. Dump it all at the open and the market
            has to swallow the size, so the price I get is worse. Dribble it out in tiny pieces
            and the leftover shares sit there while the price jumps around. Spreading the order
            evenly ignores that tradeoff. I compare a schedule that sells more up front when leftover
            risk is expensive, against even slices on the same {DATA.n_paths} price paths. The number
            I trust is how often the cost-plus-risk score beats even slices by a locked margin:{' '}
            {DATA.success_pct}%.
          </p>
          <p className="intro-detail">
            The market here is synthetic: I turn a temporary-impact knob, a permanent-impact knob,
            and a noise knob, then I cap the day at {DATA.n_bins} bins. No live broker. No smart
            order router pitch. Just dump vs dribble, then a name for the math.
          </p>
          <nav aria-label="On this page">
            <ul className="toc">
              {TOC.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <StoryBeat
          id="problem"
          kicker="The problem"
          title="Dump hurts. Dribble waits. Even slices ignore both."
          caption="Remaining inventory from open to close. Dump hits zero in the first slice. Even slices fall in a straight line. Neither one is thinking about the tradeoff."
          visual={<ScheduleViz />}
        >
          <p>
            Picture a desk that has to sell a block before the close. Two bad instincts show up
            immediately. Dump: send the whole thing now. The print is large, the price you get is
            worse, and anyone watching knows you were in a hurry. Dribble: feed it out all day in
            crumbs. Each crumb is quiet, but you still own most of the block at lunch, and a
            down-move in the afternoon is now your problem.
          </p>
          <p>
            The usual compromise is even slices: the same amount every bin until you are done.
            Traders call that TWAP, time-weighted average price. It is easy to explain and easy to
            code. It also pretends impact and leftover risk weigh the same at 10am and at 3:50pm.
            They do not.
          </p>
          <p>
            I want a schedule that spends a little more impact early so leftover size is smaller
            when the noise still has hours to run, and I want to measure that against even slices
            on the same horizon, not against a slogan.
          </p>
        </StoryBeat>

        <StoryBeat
          id="answer"
          kicker="The approach"
          title="A closed-form path that trades the two costs"
          caption="The green line is the balanced schedule. It sells about 20% in the first slice, then tails off. Even slices sell 1.6% per bin the whole way."
          visual={<ScheduleViz />}
        >
          <p>
            The math that does this has a name, Almgren-Chriss, but the picture is simpler than
            the paper. Each slice you trade shoves the price (temporary impact, gone after the
            print, plus a bit of permanent impact that stays). Each share you still hold can move
            against you until you sell it. Pick how much you care about that leftover risk, and
            there is a closed-form remaining-inventory path: a hyperbolic sine that front-loads
            when you care more, and that falls back toward even slices when you care less.
          </p>
          <p>
            I score a path as implementation shortfall (what I got vs the arrival price) plus
            leftover-inventory risk. Same score for both schedules. Same {DATA.n_bins} bins. Same
            Gaussian shocks. The balanced schedule never sees those shocks when it chooses the
            trades. If a recipe peeked at future prices, the leak test fails on purpose.
          </p>
          <p>
            A path counts as a win when the balanced score is at least {DATA.eps} better than even
            slices. That margin is locked. I do not get to nudge it after I see the percentage.
          </p>
        </StoryBeat>

        <StoryBeat
          id="result"
          kicker="The result"
          title={`${DATA.success_pct}% of paths, the balanced score wins`}
          caption={`Same ${DATA.n_paths} paths. Green bars are wins (gap at least ${DATA.eps}). Red bars are the paths where even slices still had the better score.`}
          visual={
            <>
              <ResultBento />
              <GapHistViz />
            </>
          }
        >
          <p>
            On the locked protocol the balanced schedule wins {DATA.n_win} of {DATA.n_paths} paths,
            which is {DATA.success_pct}%. Mean cost-plus-risk is {DATA.mean_j_ac} against{' '}
            {DATA.mean_j_twap} for even slices. Even slices are cheaper on impact alone (mean
            shortfall {DATA.mean_cost_twap} vs {DATA.mean_cost_ac}), which is the point: they
            dribble, so they pay less shove and sit on more leftover risk. The combined score is
            what I asked for, so that is the headline.
          </p>
          <p>
            The first slice tells the story in one number. Even slices sell {DATA.first_share_twap}%
            of the block at the open. The balanced schedule sells {DATA.first_share_ac}%. That is
            not a dump. A dump would be 100% in bin one. It is a faster start so you are not still
            holding most of the block into the afternoon noise.
          </p>
          <table className="choice-table">
            <caption className="sr-only">Balanced schedule versus even slices on the same paths</caption>
            <thead>
              <tr>
                <th scope="col">On the same {DATA.n_paths} paths</th>
                <th scope="col">Even slices (TWAP)</th>
                <th scope="col">Balanced (AC)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Win rate vs the other</td>
                <td>{(100 - DATA.success_pct).toFixed(1)}%</td>
                <td style={{ color: 'var(--good)' }}>{DATA.success_pct}%</td>
              </tr>
              <tr>
                <td>Mean cost+risk</td>
                <td>{DATA.mean_j_twap}</td>
                <td style={{ color: 'var(--good)' }}>{DATA.mean_j_ac}</td>
              </tr>
              <tr>
                <td>Mean impact cost only</td>
                <td style={{ color: 'var(--good)' }}>{DATA.mean_cost_twap}</td>
                <td>{DATA.mean_cost_ac}</td>
              </tr>
              <tr>
                <td>Sold in the first bin</td>
                <td>{DATA.first_share_twap}%</td>
                <td>{DATA.first_share_ac}%</td>
              </tr>
            </tbody>
          </table>
        </StoryBeat>

        <section className="story-beat" id="stack">
          <p className="story-kicker">Tech stack</p>
          <h2>What runs under the hood, and why</h2>
          <p className="stack-intro">
            Four pieces. Arrays for the math, tests that fail when I cheat, a fake market so the
            optimal path is checkable, and this page reading a static file.
          </p>
          <StackGrid />
        </section>

        <StoryBeat
          id="decisions"
          kicker="Design choices"
          title="The calls I made, in plain words"
          caption="Care about leftover risk, and the win rate against even slices climbs. The locked setting is the middle bar."
          visual={<AblationViz />}
        >
          <p>
            I used a synthetic Almgren-Chriss market instead of a broker tape. On a real tape I
            would not know the impact knobs, so I could not check that the closed-form path is
            actually the one the model promised. Here I can. The tradeoff is that this is not a
            live OMS result.
          </p>
          <p>
            I kept TWAP as the baseline, not VWAP and not a learned router. Even slices are the
            thing a desk already understands. If I cannot beat that on a score I defined, a fancier
            baseline would only hide it.
          </p>
          <p>
            The win rule is a locked margin, not a tie. {DATA.success_pct}% is measured at epsilon{' '}
            {DATA.eps}. Turning leftover-risk care down to 0.2 drops the win rate to{' '}
            {DATA.ablation[0].success_pct}%, because the schedule starts looking like even slices
            again. Turning it up to 2.0 pushes the first slice to {DATA.ablation[2].first_share}%
            and the win rate to {DATA.ablation[2].success_pct}%. The locked value is 1.0.
          </p>
          <div className="teach-card">
            <h3 className="teach-card__title">What I wanted vs what I built</h3>
            <table className="choice-table">
              <caption className="sr-only">Design decisions</caption>
              <thead>
                <tr>
                  <th scope="col">First instinct</th>
                  <th scope="col">What I built</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A live broker API</td>
                  <td>A synthetic impact market with caps on bins and paths</td>
                </tr>
                <tr>
                  <td>Call it a smart order router</td>
                  <td>One closed-form schedule vs even slices, same score</td>
                </tr>
                <tr>
                  <td>Report average cost only</td>
                  <td>Cost plus leftover risk, then the fraction of paths that clear a locked margin</td>
                </tr>
              </tbody>
            </table>
          </div>
        </StoryBeat>

        <StoryBeat
          id="use"
          kicker="Improve, next, run, sectors"
          title="Where this stops, and who can use the finding"
          caption="The ablation is the warning: if you barely care about leftover risk, the balanced path collapses toward even slices and the win rate falls off."
          visual={<AblationViz />}
        >
          <p>
            Weaknesses: the impact knobs are known, the block is one normalized unit, and there is
            no limit-order book. A real desk would also care about a volume curve, not just equal
            time bins. Next: swap the flat-time grid for a public volume curve as illustration
            only, still no broker.
          </p>
          <p>
            Run it locally with <code>python -m pytest tests/test_eval.py -q</code>, then{' '}
            <code>python scripts/run.py</code>, then <code>npm --prefix web run build</code>. The
            CLI prints AC vs TWAP. The page reads <code>web/src/data.ts</code>.
          </p>
          <p>
            Agency execution teams can use the dump-vs-dribble picture when a client asks why the
            algo is not TWAP. Broker algo groups can use the locked-margin score as a regression
            check when someone proposes a new schedule. Portfolio transition desks can use the
            leftover-risk term as the reason not to dribble a long unwind into the last hour.
          </p>
        </StoryBeat>

        <footer
          style={{
            borderTop: '1px solid var(--line-rule)',
            paddingTop: 'var(--space-6)',
            marginTop: 'var(--space-6)',
            color: 'var(--fg-low)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          <p style={{ maxWidth: 'var(--measure)' }}>
            I wanted a schedule that owns the impact-risk tradeoff, measured against even TWAP
            slices on the same horizon. This page is that comparison. Not a product. Not a live
            execution venue.
          </p>
        </footer>
      </main>
    </>
  )
}
