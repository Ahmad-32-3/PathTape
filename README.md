# PathTape

I need to sell a large block over a session. Dump it all at the open and the market has to swallow the size, so the price I get is worse. Dribble it out in tiny pieces and the leftover shares sit there while the price jumps around. Spreading the order evenly (TWAP) ignores that tradeoff.

I compare a schedule that sells more up front when leftover risk is expensive (Almgren-Chriss, or the closed-form discrete schedule) against even slices on the same synthetic paths. The number I trust is how often the cost-plus-risk score beats even slices by a locked margin.

Synthetic market with temporary and permanent impact so the path is checkable. No broker API.

## Run

```bash
python -m pytest tests/ -q
python scripts/run.py
npm --prefix web install
npm --prefix web run dev
```

`scripts/run.py` prints Almgren-Chriss vs TWAP. Schedule length, share conservation, and future-price leak must fail in pytest when injected.

## Layout

- `src/` impact model, schedules, score
- `scripts/run.py`
- `tests/` conservation and leak checks
- `web/` case-study page
