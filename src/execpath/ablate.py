"""Ablation on risk aversion and impact. Same paths protocol, one knob at a time."""

from . import const
from .eval import evaluate
from .schedule import almgren_chriss


def ablation(seed=const.SEED):
    rows = []
    for lam in (0.2, const.LAM, 2.0):
        m = evaluate(lam=lam, seed=seed)
        x, n = almgren_chriss(lam=lam)
        rows.append(
            {
                "knob": "risk aversion lambda",
                "value": lam,
                "success_pct": m["success_pct"],
                "first_share": float(n[0] / const.X),
                "mean_j_ac": m["mean_j_ac"],
                "mean_j_twap": m["mean_j_twap"],
            }
        )
    for eta in (1.0, const.ETA, 6.0):
        m = evaluate(eta=eta, seed=seed)
        rows.append(
            {
                "knob": "temporary impact eta",
                "value": eta,
                "success_pct": m["success_pct"],
                "first_share": m["first_share_ac"],
                "mean_j_ac": m["mean_j_ac"],
                "mean_j_twap": m["mean_j_twap"],
            }
        )
    return rows
