# Synthetic training data generator — risk_training_data.csv (1000 rows)
import numpy as np
import pandas as pd
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent / "risk_training_data.csv"


def main() -> None:
    np.random.seed(42)
    n = 1000
    weather_risk = np.random.uniform(0, 1, n)
    aqi_risk = np.random.uniform(0, 1, n)
    zone_exposure = np.random.uniform(0, 1, n)
    streak_weeks = np.random.randint(0, 13, n)
    risk_score = np.clip(
        0.35 * weather_risk * 100
        + 0.25 * aqi_risk * 100
        + 0.30 * zone_exposure * 100
        + 0.10 * (streak_weeks / 12) * 100,
        0,
        100,
    )
    df = pd.DataFrame(
        {
            "weather_risk": weather_risk,
            "aqi_risk": aqi_risk,
            "zone_exposure": zone_exposure,
            "streak_weeks": streak_weeks,
            "risk_score": risk_score,
        }
    )
    df.to_csv(OUTPUT, index=False)
    print(f"Wrote {len(df)} rows to {OUTPUT}")


if __name__ == "__main__":
    main()
