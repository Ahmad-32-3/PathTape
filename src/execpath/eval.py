"""Synthetic AC market: temp + permanent impact, then cost+risk vs TWAP."""

import numpy as np

from . import const
from .schedule import almgren_chriss, check_schedule, twap


def _costs(trades, xi, S0, eta, gamma, tau, sigma):
    """Implementation shortfall vs arrival for a sell, one row per path."""
    n_paths, n_bins = xi.shape
    n = np.asarray(trades, float)
    shock = sigma * np.sqrt(tau) * xi
    perm = gamma * n
    drift = shock - perm
    mid = np.empty((n_paths, n_bins))
    mid[:, 0] = S0
    if n_bins > 1:
        mid[:, 1:] = S0 + np.cumsum(drift[:, :-1], axis=1)
    exec_px = mid - 0.5 * gamma * n - eta * (n / tau)
    return (n * (S0 - exec_px)).sum(axis=1)


def inventory_risk(x, sigma, tau):
    return float(sigma**2 * tau * np.sum(np.asarray(x[:-1], float) ** 2))


def scores(cost, x, lam, sigma, tau):
    return cost + lam * inventory_risk(x, sigma, tau)


def evaluate(
    n_bins=const.N_BINS,
    n_paths=const.N_PATHS,
    X=const.X,
    S0=const.S0,
    tau=const.TAU,
    sigma=const.SIGMA,
    eta=const.ETA,
    gamma=const.GAMMA,
    lam=const.LAM,
    eps=const.EPS,
    seed=const.SEED,
):
    if n_bins > const.T_CAP:
        raise ValueError(f"HARD FAIL: T={n_bins} over cap {const.T_CAP}")
    if n_paths > const.PATH_CAP:
        raise ValueError(f"HARD FAIL: N={n_paths} over cap {const.PATH_CAP}")

    x_ac, n_ac = almgren_chriss(X, n_bins, tau, sigma, eta, gamma, lam)
    x_tw, n_tw = twap(X, n_bins)
    check_schedule(x_ac, n_ac, X, n_bins)
    check_schedule(x_tw, n_tw, X, n_bins)

    rng = np.random.default_rng(seed)
    xi = rng.standard_normal((n_paths, n_bins))
    c_ac = _costs(n_ac, xi, S0, eta, gamma, tau, sigma)
    c_tw = _costs(n_tw, xi, S0, eta, gamma, tau, sigma)
    j_ac = scores(c_ac, x_ac, lam, sigma, tau)
    j_tw = scores(c_tw, x_tw, lam, sigma, tau)
    gap = j_tw - j_ac
    wins = gap >= eps
    success_pct = 100.0 * float(np.mean(wins))
    return {
        "success_pct": success_pct,
        "n_win": int(np.sum(wins)),
        "n_paths": n_paths,
        "n_bins": n_bins,
        "eps": eps,
        "lam": lam,
        "eta": eta,
        "gamma": gamma,
        "sigma": sigma,
        "mean_j_ac": float(np.mean(j_ac)),
        "mean_j_twap": float(np.mean(j_tw)),
        "mean_cost_ac": float(np.mean(c_ac)),
        "mean_cost_twap": float(np.mean(c_tw)),
        "mean_gap": float(np.mean(gap)),
        "x_ac": x_ac.tolist(),
        "n_ac": n_ac.tolist(),
        "x_twap": x_tw.tolist(),
        "n_twap": n_tw.tolist(),
        "gaps": gap.tolist(),
        "first_share_ac": float(n_ac[0] / X),
        "first_share_twap": float(n_tw[0] / X),
        "seed": seed,
    }


def print_report(m):
    print(
        f"AC vs TWAP  success_pct {m['success_pct']:.1f}  "
        f"({m['n_win']}/{m['n_paths']} paths, J_ac <= J_twap - {m['eps']})"
    )
    print(
        f"mean J  AC {m['mean_j_ac']:.3f}  TWAP {m['mean_j_twap']:.3f}  "
        f"gap {m['mean_gap']:.3f}  first-slice AC {100*m['first_share_ac']:.1f}%  "
        f"TWAP {100*m['first_share_twap']:.1f}%"
    )
