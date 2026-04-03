# NammaShield — ML Microservice

Flask-based machine learning microservice for NammaShield, providing real-time risk scoring and fraud detection for parametric insurance claims.

## Architecture

This service runs independently from the Next.js frontend and is deployed to **Render** (free tier).

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/ml/risk-score` | Predict disruption risk → returns `{ risk_score, tier, weekly_premium }` |
| `POST` | `/ml/fraud-score` | Score claim for fraud → returns `{ fraud_score, decision }` |
| `GET` | `/health` | Health check → returns `{ status: "ok" }` |

## Models

- **Risk Model** (`risk_model.pkl`) — GradientBoostingRegressor trained on synthetic disruption data
- **Fraud Model** (`fraud_model.pkl`) — GradientBoostingClassifier trained on synthetic fraud patterns

## Local Development

```bash
cd ml/
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Generate training data and train models
python train_data.py
python risk_model.py
python fraud_model.py

# Start the API
python api.py
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port to run the service on (default: 5000) |
| `FLASK_ENV` | `development` or `production` |

## Deployment

Deployed to Render via `render.yaml`. The build step automatically trains both models before starting the server.
