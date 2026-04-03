# Flask API entry point
from __future__ import annotations

import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from risk_model import predict as risk_predict
from fraud_model import score as fraud_score_fn

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/ml/risk-score")
def ml_risk_score():
    try:
        payload = request.get_json(silent=True) or {}
        city = payload.get("city")
        zone = payload.get("zone")
        streak_weeks = int(payload.get("streak_weeks", 0))
        if not city or not zone:
            return jsonify({"error": "city and zone required"}), 400
        out = risk_predict(
            {"city": str(city), "zone": str(zone), "streak_weeks": streak_weeks}
        )
        return jsonify(out)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/ml/fraud-score")
def ml_fraud_score():
    try:
        payload = request.get_json(silent=True) or {}
        required = ("claim_velocity", "zone_coherence_score", "same_device_cluster")
        for k in required:
            if k not in payload:
                return jsonify({"error": f"missing {k}"}), 400
        out = fraud_score_fn(
            {
                "claim_velocity": payload.get("claim_velocity"),
                "zone_coherence_score": payload.get("zone_coherence_score"),
                "same_device_cluster": payload.get("same_device_cluster"),
            }
        )
        return jsonify(out)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_ENV") == "development")
