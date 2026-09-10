# Locked DESIGN knobs. Caps equal the run size. Over-cap is a hard fail.

N_BINS = 64  # one session in 64 slices; not a toy, not a live book
N_PATHS = 500
X = 1.0  # one block (normalized shares)
S0 = 100.0
TAU = 1.0  # one time unit per bin; T = N_BINS * TAU
SIGMA = 0.35  # shock per sqrt(bin), in price units
ETA = 2.5  # temporary impact ($ per (share/time))
GAMMA = 0.08  # permanent impact ($ per share)
LAM = 1.0  # risk aversion on leftover inventory
EPS = 0.15  # AC wins a path when J_ac <= J_twap - EPS
SEED = 0

T_CAP = 64
PATH_CAP = 500
