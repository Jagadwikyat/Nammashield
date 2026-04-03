# Gradient Boosted risk scorer — logic in Section 5
from __future__ import annotations

import hashlib
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

DATA_PATH = Path(__file__).resolve().parent / "risk_training_data.csv"
MODEL_PATH = Path(__file__).resolve().parent / "risk_model.pkl"


def _features_from_city_zone(city: str, zone: str, streak_weeks: int) -> dict[str, float]:
    h = hashlib.md5(f"{city}|{zone}".encode()).hexdigest()
    weather_risk = int(h[:8], 16) / 0xFFFFFFFF
    aqi_risk = int(h[8:16], 16) / 0xFFFFFFFF
    zone_exposure = int(h[16:24], 16) / 0xFFFFFFFF
    return {
        "weather_risk": weather_risk,
        "aqi_risk": aqi_risk,
        "zone_exposure": zone_exposure,
        "streak_weeks": float(min(max(streak_weeks, 0), 12)),
    }


def _tier_from_score(risk_score: float) -> tuple[str, float]:
    s = float(np.clip(risk_score, 0, 100))
    if s <= 30:
        return "Basic", 50.0
    if s <= 60:
        return "Standard", 100.0
    if s <= 80:
        return "Pro", 150.0
    return "Surge", 200.0


def train() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Missing {DATA_PATH}; run train_data.py first")
    df = pd.read_csv(DATA_PATH)
    X = df[["weather_risk", "aqi_risk", "zone_exposure", "streak_weeks"]]
    y = df["risk_score"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = GradientBoostingRegressor(random_state=42)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, pred)
    print(f"MAE (test): {mae:.4f}")
    joblib.dump(model, MODEL_PATH)
    print(f"Saved {MODEL_PATH}")


def _row_from_features(features: dict[str, float]) -> np.ndarray:
    return np.array(
        [
            [
                features["weather_risk"],
                features["aqi_risk"],
                features["zone_exposure"],
                features["streak_weeks"],
            ]
        ]
    )


def predict(features_dict: dict) -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("risk_model.pkl not found; run risk_model.py to train")
    model = joblib.load(MODEL_PATH)
    city = str(features_dict.get("city", ""))
    zone = str(features_dict.get("zone", ""))
    streak = int(features_dict.get("streak_weeks", 0))
    feats = _features_from_city_zone(city, zone, streak)
    risk_raw = float(model.predict(_row_from_features(feats))[0])
    risk_score = float(np.clip(round(risk_raw, 2), 0, 100))
    tier, weekly_premium = _tier_from_score(risk_score)
    return {
        "risk_score": risk_score,
        "tier": tier,
        "weekly_premium": weekly_premium,
    }


if __name__ == "__main__":
    train()
