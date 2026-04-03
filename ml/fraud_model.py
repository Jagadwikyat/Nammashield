# Fraud detection classifier — logic in Section 5
from __future__ import annotations

import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import GradientBoostingClassifier

MODEL_PATH = Path(__file__).resolve().parent / "fraud_model.pkl"


def _build_synthetic(n: int = 500, seed: int = 7) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    claim_velocity = rng.uniform(0, 1, n)
    zone_coherence_score = rng.uniform(0, 1, n)
    same_device_cluster = rng.uniform(0, 1, n)
    # Higher velocity + low coherence + high device clustering → fraud
    score = (
        0.45 * claim_velocity
        + 0.35 * (1 - zone_coherence_score)
        + 0.2 * same_device_cluster
    )
    label = (score > rng.uniform(0.5, 1.0, n)).astype(int)
    X = np.column_stack([claim_velocity, zone_coherence_score, same_device_cluster])
    return X, label


def train() -> None:
    X, y = _build_synthetic(500)
    model = GradientBoostingClassifier(random_state=42)
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved {MODEL_PATH}")


def score(features_dict: dict) -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("fraud_model.pkl not found; run fraud_model.py to train")
    model = joblib.load(MODEL_PATH)
    x = np.array(
        [
            [
                float(features_dict.get("claim_velocity", 0)),
                float(features_dict.get("zone_coherence_score", 0)),
                float(features_dict.get("same_device_cluster", 0)),
            ]
        ]
    )
    proba = float(model.predict_proba(x)[0][1])
    if proba < 0.3:
        decision = "auto_approve"
    elif proba <= 0.7:
        decision = "watchlist"
    else:
        decision = "review"
    return {"fraud_score": proba, "decision": decision}


if __name__ == "__main__":
    train()
