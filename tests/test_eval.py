import numpy as np
import pytest

from execpath import const
from execpath.ablate import ablation
from execpath.eval import evaluate
from execpath.schedule import (
    almgren_chriss,
    check_no_price_leak,
    check_schedule,
    twap,
)


def test_schedule_length_and_conservation():
    x, n = almgren_chriss()
    check_schedule(x, n, const.X, const.N_BINS)
    xt, nt = twap()
    check_schedule(xt, nt, const.X, const.N_BINS)
    assert len(n) == const.N_BINS
    assert np.isclose(n.sum(), const.X)


def test_schedule_length_fails_when_wrong():
    x, n = almgren_chriss()
    with pytest.raises(ValueError, match="length"):
        check_schedule(x[:-1], n, const.X, const.N_BINS)


def test_conservation_fails_when_wrong():
    x, n = almgren_chriss()
    n_bad = n.copy()
    n_bad[0] += 0.2
    with pytest.raises(ValueError, match="conservation"):
        check_schedule(x, n_bad, const.X, const.N_BINS)


def test_leak_injection_fails():
    """A schedule that peeks at future prices must be rejected."""
    _, n = almgren_chriss()
    rng = np.random.default_rng(1)
    future_prices = rng.normal(const.S0, 1.0, const.N_BINS)
    n_cheat = n + 0.01 * (future_prices - const.S0)
    with pytest.raises(ValueError, match="leak"):
        check_no_price_leak(n, n_cheat)


def test_schedule_ignores_price_shuffle():
    _, n = almgren_chriss()
    rng = np.random.default_rng(2)
    _ = rng.normal(const.S0, 1.0, const.N_BINS)
    _, n_again = almgren_chriss()
    check_no_price_leak(n, n_again)


def test_ac_front_loads_vs_twap():
    _, n_ac = almgren_chriss()
    _, n_tw = twap()
    assert n_ac[0] > n_tw[0]


def test_evaluate_beats_twap_floor():
    m = evaluate()
    assert m["n_bins"] == const.N_BINS
    assert m["n_paths"] == const.N_PATHS
    assert m["success_pct"] >= 85.0
    assert m["mean_j_ac"] <= m["mean_j_twap"] - const.EPS


def test_caps_reject_over():
    with pytest.raises(ValueError, match="HARD FAIL"):
        evaluate(n_bins=const.T_CAP + 1)
    with pytest.raises(ValueError, match="HARD FAIL"):
        evaluate(n_paths=const.PATH_CAP + 1)


def test_ablation_lambda_front_loads():
    rows = ablation()
    lam_rows = [r for r in rows if r["knob"].startswith("risk")]
    assert len(lam_rows) == 3
    shares = [r["first_share"] for r in lam_rows]
    assert shares[0] < shares[1] < shares[2]
    assert all(r["success_pct"] >= 0 for r in rows)
