from __future__ import annotations
import os
from typing import Callable

from ..config import settings

try:
    import pennylane as qml
    from pennylane.optimize import AdamOptimizer
    PENNYLANE_AVAILABLE = True
except Exception:  # pragma: no cover
    PENNYLANE_AVAILABLE = False


def optimize_threshold(initial_threshold: float, loss_fn: Callable[[float], float], steps: int = 50) -> float:
    if not settings.enable_quantum_optimizer or not PENNYLANE_AVAILABLE:
        # Fallback to simple gradient-free search
        best_t = initial_threshold
        best_loss = loss_fn(best_t)
        for delta in [ -0.2, -0.1, -0.05, -0.01, 0.0, 0.01, 0.05, 0.1, 0.2 ]:
            t = max(0.3, min(0.9, initial_threshold + delta))
            l = loss_fn(t)
            if l < best_loss:
                best_t, best_loss = t, l
        return best_t

    dev = qml.device("default.qubit", wires=2)

    @qml.qnode(dev)
    def circuit(theta):
        qml.RY(theta, wires=0)
        qml.CNOT(wires=[0, 1])
        return qml.expval(qml.PauliZ(0))

    opt = AdamOptimizer(stepsize=0.05)
    theta = initial_threshold
    for _ in range(steps):
        def qloss(t):
            # Map circuit output to [0,1] then evaluate external loss
            val = (1 + circuit(t)) / 2
            scaled = 0.3 + val * 0.6
            return loss_fn(scaled)
        theta, _ = opt.step_and_cost(lambda p: qloss(p), theta)
    # Final mapping to threshold domain
    val = (1 + circuit(theta)) / 2
    return float(0.3 + val * 0.6)