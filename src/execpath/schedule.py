"""Discrete Almgren–Chriss schedule and TWAP. Schedule never sees prices."""

import numpy as np

from . import const


def twap(X=const.X, n_bins=const.N_BINS):
    """Even slices. Remaining inventory falls on a straight line."""
    n = np.full(n_bins, X / n_bins)
    x = np.linspace(X, 0.0, n_bins + 1)
    return x, n


def almgren_chriss(
    X=const.X,
    n_bins=const.N_BINS,
    tau=const.TAU,
    sigma=const.SIGMA,
    eta=const.ETA,
    gamma=const.GAMMA,
    lam=const.LAM,
):
    """Closed-form discrete AC holdings. Front-loads when risk aversion is high.

    x_j = X * sinh(κ(T-t_j)) / sinh(κT), κ from Almgren–Chriss (2000).
    """
    eta_tilde = eta - 0.5 * gamma * tau
    if eta_tilde <= 0:
        raise ValueError("eta_tilde must be positive (eta > gamma*tau/2)")
    arg = 1.0 + (lam * sigma**2 * tau**2) / (2.0 * eta_tilde)
    t = np.arange(n_bins + 1) * tau
    T = n_bins * tau
    if arg <= 1.0 + 1e-12:
        return twap(X, n_bins)
    kappa = np.arccosh(arg) / tau
    denom = np.sinh(kappa * T)
    x = X * np.sinh(kappa * (T - t)) / denom
    x[0] = X
    x[-1] = 0.0
    n = x[:-1] - x[1:]
    return x, n


def check_schedule(x, n, X, n_bins):
    if len(n) != n_bins or len(x) != n_bins + 1:
        raise ValueError("schedule length")
    if not np.isclose(n.sum(), X) or not np.isclose(x[0], X) or not np.isclose(x[-1], 0.0):
        raise ValueError("conservation")
    if not np.allclose(x[:-1] - x[1:], n):
        raise ValueError("conservation")


def check_no_price_leak(n_plain, n_with_prices):
    """A valid schedule is identical after future prices are shuffled in."""
    if not np.allclose(n_plain, n_with_prices, rtol=0, atol=1e-12):
        raise ValueError("leak: schedule used future prices")
