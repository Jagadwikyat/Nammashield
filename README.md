# NammaShield 🛡️

### AI-Powered Parametric Income Protection for Gig Workers

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Phase](https://img.shields.io/badge/phase-1--ideation-orange)
![Hackathon](https://img.shields.io/badge/Guidewire-DEVTrails%202026-purple)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution-nammashield)
- [Persona](#-target-persona)
- [System Architecture](#-system-architecture)
- [Core Features](#-core-features)
  - [AI-Powered Risk Assessment](#1-ai-powered-risk-assessment)
  - [Intelligent Fraud Detection](#2-intelligent-fraud-detection)
  - [Parametric Automation](#3-parametric-automation)
  - [Integration Capabilities](#4-integration-capabilities)
- [Weekly Premium Model](#-weekly-premium-model)
- [Payout Model](#-payout-model-sustainable)
- [Onboarding Flow](#-onboarding-flow)
- [Demo Workflow](#-demo-workflow)
- [Tech Stack](#-tech-stack)
- [Key Design Decisions](#-key-design-decisions)
- [Regulatory Pathway](#-regulatory-pathway)
- [Project Structure](#-project-structure)
- [Team](#-team)

---

## 🚨 Problem Statement

India has **15M+ gig delivery workers** across Swiggy, Zomato, Zepto, and Amazon. These workers are the backbone of the digital economy — but they operate with **zero income safety net**.

External disruptions beyond their control can wipe out **20–40% of weekly earnings** in a single day:

| Disruption | Impact |
|---|---|
| Heavy rainfall (>15mm/hr) | Orders drop, roads flood, workers can't deliver |
| Extreme heat (>42°C) | Platform-side restrictions, health risk |
| Severe air quality (AQI >300) | Outdoor work becomes dangerous |
| Civil shutdown / curfew | Zone access blocked entirely |

**The gap:** No insurance product today is designed for a worker who earns week-to-week, works outdoors, and loses income not from an accident — but from weather they cannot control.

Traditional insurance fails here because:
- It requires manual claims, documentation, and weeks of processing
- It covers assets and health — not **lost daily wages**
- It has monthly premiums misaligned with weekly pay cycles
- It demands trust from workers who have historically been underserved by financial institutions

---

## 💡 Our Solution: NammaShield

NammaShield is a **parametric, AI-enabled income protection platform** built exclusively for food delivery partners (Swiggy / Zomato).

> "We don't insure accidents or assets — we insure effort. When a gig worker shows up during disruption and still loses income, our system detects it and pays instantly."

**What makes it different:**

- ✅ **Zero-touch payouts** — no claims, no paperwork, no waiting
- ✅ **Weekly pricing** — aligned to how gig workers actually earn
- ✅ **100% public data** — all triggers use verifiable, free-tier APIs
- ✅ **Platform-independent** — requires nothing from Swiggy or Zomato
- ✅ **Effort-based** — validates worker activity before paying, not just the event
- ✅ **Actuarially sustainable** — deductibles, caps, and capped loss ratios built in

---

## 🎯 Target Persona

**Who we serve:** Food delivery partners on Swiggy / Zomato in Tier-1 Indian cities (Chennai, Mumbai, Delhi, Bengaluru, Hyderabad).

| Attribute | Detail |
|---|---|
| Daily schedule | 6–10 hours/day, mostly 10am–10pm |
| Weekly income | ₹3,000–₹5,000 (city + platform dependent) |
| Primary disruption risk | Rain, heat, curfew |
| Payment preference | UPI (PhonePe / Google Pay) |
| Device | Android smartphone, 4G |
| Trust level | Low for institutions; high for OTP/UPI flows |
| Key pain | No income when disruption hits, no recourse |

**Why food delivery specifically?** Of all gig segments, food delivery is the most weather-sensitive. A customer cancels a food order in rain; they don't cancel a grocery delivery the same way. The causal link between weather event → income loss is direct, measurable, and immediate — exactly what a parametric insurance product requires.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Worker Interface (PWA)                  │
│        Onboarding │ Dashboard │ Policy │ Payout History     │
└─────────────────────────────┬───────────────────────────────┘
                               │
┌─────────────────────────────▼───────────────────────────────┐
│                        AI Core Engine                       │
│   Risk Scorer │ Premium Calculator │ Fraud Intelligence     │
└──────┬──────────────────────┬──────────────────────┬────────┘
       │                      │                      │
┌──────▼──────┐   ┌───────────▼──────────┐  ┌───────▼───────┐
│  Trigger    │   │   Parametric Engine  │  │ Fraud Checks  │
│  Monitor    │   │  (Public APIs only)  │  │  (ML + Rules) │
└──────┬──────┘   └───────────┬──────────┘  └───────┬───────┘
       │                      │                      │
┌──────▼──────────────────────▼──────────────────────▼───────┐
│                 Zero-Touch Payout Pipeline                  │
│     Auto-initiate → Fraud score → UPI transfer → Notify    │
└─────────────────────────────────────────────────────────────┘
```

**End-to-end flow:**

```
Worker enrolls → Weekly premium deducted → 
Disruption trigger fires (public API) → 
Worker GPS zone validated (own app) → 
Active score computed → 
Fraud check (<90 seconds) → 
UPI payout → 
WhatsApp notification
```

---

## 🧩 Core Features

---

### 1. AI-Powered Risk Assessment

**Objective:** Predict disruption likelihood for a specific worker's zone and week, and assign a fair weekly premium.

#### Inputs to the Risk Model

| Input | Source | Weight |
|---|---|---|
| Weather forecast (7-day) | OpenWeatherMap free tier | 0.30 |
| AQI level for zone | CPCB open API | 0.25 |
| Zone historical disruption freq. | Internal (built from IMD archives) | 0.25 |
| Worker claim-free streak | Internal DB | 0.20 (inverted) |

#### Risk Score Formula

```
Risk Score (0–100) =
  (Weather Risk × 0.30) +
  (AQI Risk × 0.25) +
  (Zone Exposure × 0.25) +
  ((1 - Claim-Free Weeks / 12) × 0.20)
```

> **Note on weights:** These are initial heuristic weights tuned to Chennai/Mumbai historical disruption patterns. In production, these weights would be trained on 3-year IMD + CPCB historical data using a Gradient Boosted Regressor. The model is transparent by design — a worker can see exactly which factor is driving their premium.

#### Premium Tier Output

| Tier | Risk Score | Weekly Premium | Max Weekly Coverage |
|---|---|---|---|
| Basic | 0–30 (low risk) | ₹50 | ₹400 |
| Standard | 31–60 (medium risk) | ₹100 | ₹700 |
| Pro | 61–80 (high risk) | ₹150 | ₹1,000 |
| Surge | 81–100 (monsoon / heatwave week) | ₹200 | ₹1,200 |

#### Loyalty (Streak) Discount

Workers with zero claims build a streak that reduces their premium:
- 4 consecutive clean weeks → 10% discount next week
- 8 consecutive clean weeks → 20% discount
- 12+ consecutive clean weeks → 25% discount + tier upgrade

This directly addresses adverse selection by incentivising low-risk workers to enrol and stay enrolled.

---

### 2. Intelligent Fraud Detection

NammaShield uses a **4-layer fraud detection stack**. The ML fraud scorer outputs a confidence score from 0.0 to 1.0. Below 0.3 = auto-approve. Above 0.7 = human review queue. Between 0.3 and 0.7 = approve with watchlist flag.

#### Layer 1 — Identity
- Phone OTP via Firebase Auth / MSG91
- Platform Partner ID photo upload → OCR extracted and stored (Tesseract.js, runs client-side)
- UPI ID verified by ₹1 test credit at onboarding

> **No Aadhaar.** UIDAI regulations prohibit unlicensed entities from collecting or verifying Aadhaar. We use platform ID + UPI verification instead — which is more contextually relevant anyway.

#### Layer 2 — Device
- Device fingerprinting at onboarding (browser fingerprint hash)
- One active policy per device/UPI combination
- Alert on login from new device

#### Layer 3 — Location (Own App GPS)
- Worker grants location permission to NammaShield PWA at onboarding
- App collects GPS during active hours via Web Background Sync
- **No platform API required** — we own this data
- Validation: worker's GPS must place them within their registered delivery zone at trigger time

> **This is the key architectural decision.** By collecting location ourselves, we are 100% independent of Swiggy/Zomato data. The GPS validation layer is real, not mocked.

#### Layer 4 — Behavioural (ML)
- Claim velocity: flagged if claiming every single trigger event across multiple weeks
- Zone coherence: trigger event cross-referenced with GPS inactivity pattern of all workers in zone
- Pattern anomaly: Gradient Boosted Classifier trained on synthetic fraud scenarios
- Ring detection: alert if >50 claims originate from same Wi-Fi network or same 3 devices within 10 minutes

#### Active Score (Worker Effort Validation)

```
Active Score = (GPS-confirmed online hours in trigger window) 
               ÷ (expected hours in same window)
```

**Threshold:** Active Score ≥ 0.35 required for payout eligibility.

> **Why 0.35?** This means the worker only needs to have been active for 35% of their expected hours during the disruption window. We deliberately set this low — if it's raining heavily, even *attempting* to work and finding no orders is a legitimate income loss. Intent matters, not just output.

#### Fraud Check Decision Tree

```
IF (Trigger confirmed by public API)
AND (Worker GPS in affected zone)
AND (Active Score ≥ 0.35)
AND (Fraud score < 0.3)
  → AUTO-APPROVE payout

IF (Fraud score 0.3–0.7)
  → APPROVE + add to watchlist

IF (Fraud score > 0.7)
  → FLAG for human review (48hr SLA)

IF (Active Score < 0.35 AND trigger confirmed)
  → REJECT with transparent explanation + manual appeal option
```

---

### 3. Parametric Automation

#### The 4 Triggers (All 100% Public Data)

| # | Trigger | Threshold | Data Source | Duration Required |
|---|---|---|---|---|
| 1 | Heavy rain | Rainfall >15mm/hr OR IMD "heavy rain warning" for pincode | OpenWeatherMap (free) + IMD open API | Continuous 2+ hrs in worker zone |
| 2 | Extreme heat | Temp >42°C AND heat index >48°C during 11am–4pm | OpenWeatherMap `feels_like` field | 3+ hrs in daytime window |
| 3 | Severe AQI | AQI >300 (CPCB "Severe" category) | CPCB open data — api.cpcb.gov.in | 4+ continuous hrs at nearest station |
| 4 | Civil shutdown | Govt. notification OR zone-wide GPS inactivity >70% of enrolled workers | NewsAPI (free tier) + own GPS inactivity signal | Declared duration OR 4+ hrs idle |

> **Why these four?** Each has a public, real-time, verifiable data source. Each has a direct causal link to food delivery income loss. Each has a clear, binary threshold. There is no ambiguity in whether the trigger fired — the data either crosses the threshold or it does not.

> **On the civil shutdown trigger:** We use a dual-signal approach. Official notification (NewsAPI) is the primary signal. If no notification exists but >70% of NammaShield workers in a zone go GPS-inactive simultaneously, that behavioural signal constitutes independent confirmation. This is a novel mechanism — the network of workers essentially validates the disruption for each other.

#### Trigger-to-Payout Timeline

```
Trigger threshold crossed         → T+0
Policy match for all zone workers → T+10 seconds
GPS zone check                    → T+30 seconds
Fraud ML scoring                  → T+60–90 seconds
UPI payout initiated              → T+3 minutes
Worker WhatsApp notification      → T+5 minutes
```

---

### 4. Integration Capabilities

| Integration | Status | Tool / API |
|---|---|---|
| Weather (rain, heat) | ✅ Real (free tier) | OpenWeatherMap API |
| Air quality | ✅ Real (free tier) | CPCB open data API |
| Civil disruption detection | ✅ Real (free tier) | NewsAPI |
| Worker GPS (own) | ✅ Real | Browser Geolocation API + Background Sync |
| UPI Payout | 🟡 Sandbox | Razorpay Test Mode |
| WhatsApp notification | 🟡 Trial | Twilio WhatsApp Business API |
| Platform data (Swiggy/Zomato) | ❌ Not used | Zero dependency — by design |

**Platform independence is a core architectural principle, not a limitation.** NammaShield deliberately requires no integration with delivery platforms. This means no liability transfer to platforms, no data-sharing agreements, no regulatory exposure for Swiggy/Zomato, and no dependency on their cooperation. Platforms can optionally offer NammaShield as a bundled partner benefit — but they do not need to for the product to work.

---

## 💰 Weekly Premium Model

Gig workers operate week-to-week. Aligning the premium cycle to the earnings cycle is not a minor UX decision — it is fundamental to product adoption. A monthly premium would require a worker to pre-fund a protection they won't benefit from for 30 days. A weekly premium means every ₹50 they spend has a 7-day coverage window they actually care about.

**Premium deduction timing:** Every Monday at 6:00 AM, the weekly premium for the coming week is debited from the worker's linked UPI. Workers can toggle auto-renewal on/off. If auto-renewal is off, a WhatsApp reminder fires Sunday evening.

**Income band assignment (no self-declaration):**

Workers do not declare their own income. Payout coverage is assigned based on city × platform fixed bands from publicly available earnings data:

| City | Platform | Weekly Income Band | Coverage Band |
|---|---|---|---|
| Chennai | Swiggy | ₹3,000–₹3,800 | ₹400–₹700 |
| Mumbai | Zomato | ₹3,500–₹4,500 | ₹500–₹850 |
| Delhi | Swiggy | ₹3,200–₹4,200 | ₹450–₹750 |
| Bengaluru | Zomato | ₹3,800–₹5,000 | ₹550–₹900 |

This eliminates the single biggest fraud surface in the system — a worker declaring ₹8,000 income to inflate their payout when they actually earn ₹3,000.

---

## 💸 Payout Model (Sustainable)

### The Problem with Naive Parametric Insurance

If a worker earns ₹4,000/week and pays ₹100 premium, and a 40% rain-driven income loss triggers a ₹1,600 payout — the insurer has a loss ratio of 1,600%. That product dies in month 2.

### Our Sustainable Model

**Three controls keep the model viable:**

1. **Deductible — first 2 hours of any disruption are not covered.** The worker bears a small portion of every event. This is standard insurance practice.

2. **Payout rate is 70% of lost income, not 100%.** This is income *protection*, not income *replacement*. The worker still has some skin in the game.

3. **Weekly payout cap = 1.5× the weekly premium paid.** Maximum payout is bounded relative to what was collected. At ₹100 premium, max weekly payout is ₹300 regardless of income band.

### Payout Formula

```
Covered Hours    = Total disruption hours − 2 (deductible)
Hourly Rate      = City income band midpoint ÷ 56 (average hrs/week)
Raw Payout       = Covered Hours × Hourly Rate × 0.70 (protection rate)
Final Payout     = min(Raw Payout, 1.5 × Weekly Premium Paid)
```

### Worked Example

- Worker in Chennai, Standard tier, premium ₹100
- Disruption: 5 hours of heavy rain
- Covered hours: 5 − 2 = 3 hours
- Hourly rate: ₹3,400 ÷ 56 = ₹60.7
- Raw payout: 3 × ₹60.7 × 0.70 = ₹127.5
- Cap: 1.5 × ₹100 = ₹150
- **Final payout: ₹127.50 ✅**

### Unit Economics (Pool Level)

At 35% weekly claim frequency (based on IMD Tier-1 city disruption data):
- 65% of weeks = premium collected, zero payout
- 35% of weeks = average payout ~₹130 against ₹100 premium
- Portfolio loss ratio: ~45% — well within the 60–70% target for viable insurance pools

---

## 📱 Onboarding Flow

Designed for under 5 minutes. No documentation. No branch visit.

```
Step 1 — Phone OTP (30 sec)
  └─ WhatsApp number → OTP → verified

Step 2 — Platform ID (2 min)
  └─ Upload Swiggy/Zomato Partner App screenshot
  └─ OCR extracts Partner ID and name automatically

Step 3 — UPI Verification (1 min)
  └─ Enter UPI ID
  └─ ₹1 test credit sent → confirmed live

Step 4 — City + Zone (30 sec)
  └─ Select city and primary delivery zone
  └─ Risk score computed → premium tier shown

Step 5 — Activate (10 sec)
  └─ Review weekly plan → tap "Activate"
  └─ GPS permission granted
  └─ Coverage begins next Monday
```

**No Aadhaar. No face scan. No branch visit. No waiting.**

---

## 🎬 Demo Workflow

The Phase 1 demo shows the core concept end-to-end using mocked/sandboxed APIs where noted.

1. **Onboarding** — new worker completes 5-step flow, Partner ID OCR'd, UPI verified
2. **Dashboard** — worker sees active policy, risk score, premium tier, coverage amount
3. **Disruption simulation** — facilitator triggers "heavy rain event" in Chennai Zone 4 via admin panel
4. **Live monitoring** — OpenWeatherMap API (or mock) crosses threshold; system detects affected policyholders
5. **Activity check** — worker's GPS (simulated active) returns Active Score 0.72
6. **Fraud score** — ML model returns 0.14 (clean)
7. **Auto-payout** — ₹127 sent via Razorpay sandbox to worker's linked UPI ID
8. **Notification** — WhatsApp message (Twilio trial): *"Heavy rain detected in your zone. You were active. ₹127 has been credited. Ref: NS-20260320-0041"*
9. **History screen** — worker sees payout log with full transparency on why it was triggered

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React + Vite PWA | Works offline, no app store, fast on 4G |
| Styling | Tailwind CSS | Rapid UI, mobile-first |
| i18n | react-i18next | Hindi, Tamil, Telugu, Kannada |
| Backend | Node.js + Express | Lightweight, fast API layer |
| Database | PostgreSQL | Policy/claim/worker records |
| Cache / State | Redis | Real-time trigger event state |
| ML (Risk + Fraud) | Python + scikit-learn | Gradient Boosted models, pickled and served via Flask microservice |
| OCR (KYC) | Tesseract.js | Client-side Partner ID extraction — no server round trip |
| Location | Browser Geolocation API | Native, no SDK, works on all Android |
| Weather trigger | OpenWeatherMap API | Free tier, 1000 calls/day |
| AQI trigger | CPCB Open Data | No auth, free, official government source |
| News trigger | NewsAPI | Free tier for disruption/curfew detection |
| Payments | Razorpay Test Mode | UPI simulation, full sandbox |
| Notifications | Twilio WhatsApp (trial) | Workers already use WhatsApp daily |
| Hosting | Vercel (frontend) + Railway (backend) | Both have free tiers sufficient for demo |

---

## 🧠 Key Design Decisions

### ✅ No Aadhaar — replaced with platform-native KYC
UIDAI regulations prohibit unauthorized entities from Aadhaar verification. Our KYC (OTP + Partner ID OCR + UPI test) is faster, legal, and more relevant to the use case.

### ✅ Zero platform dependency
No Swiggy/Zomato API calls. NammaShield collects its own GPS data, uses public environmental APIs, and validates via its own behavioural signals. Platforms are potential distribution partners — not technical dependencies.

### ✅ Fixed income bands — no self-declaration
Workers cannot inflate their declared income to boost payouts. Coverage is capped by city × platform earnings bands derived from public data.

### ✅ Deductible + cap model
The 2-hour deductible and 1.5× premium cap ensure the product is actuarially viable at portfolio scale. Loss ratio modelled at ~45% — sustainable.

### ✅ Active Score threshold at 0.35
Deliberately low — we credit intent, not just output. A worker who is online during a disruption but receives no orders has still lost income.

### ✅ Streak discount for adverse selection resistance
Workers with clean claims histories get cheaper premiums, incentivising low-risk workers to enrol and stay enrolled. This is the mechanism that prevents pool collapse from adverse selection.

### ✅ Weekly coverage window with hard boundaries
Coverage runs Monday 00:00 to Sunday 23:59. Disruptions at the boundary are evaluated against the active policy at time of trigger. No ambiguity.

### ✅ Smart suggestions removed from core scope
"Switch zone" / "work after 6 PM" type advice was considered and removed. It contradicts our core positioning: we protect income against uncontrollable events — we don't advise workers on how to avoid them.

---

## ⚖️ Regulatory Pathway

NammaShield does not claim to be a licensed insurer. The intended go-to-market pathway is:

**IRDAI Regulatory Sandbox** — IRDAI's Regulatory Sandbox framework allows fintech startups to pilot insurance products under a licensed insurer's umbrella without holding a full license. NammaShield would operate as a **technology and distribution layer**, with formal underwriting provided by a licensed insurance partner. This is the same model used by products like Toffee Insurance and Instasure in India.

For the hackathon, this is our stated Phase 3 go-live pathway. For Phases 1 and 2, the product operates as a demonstration prototype.

---

## 📁 Project Structure

```
nammashield/
├── client/                     # React PWA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Onboarding/     # 5-step onboarding flow
│   │   │   ├── Dashboard/      # Worker policy dashboard
│   │   │   ├── Policy/         # Policy details + premium
│   │   │   ├── Payout/         # Payout confirmation screen
│   │   │   └── History/        # Claim + payout history
│   │   ├── components/         # Shared UI components
│   │   ├── services/           # API calls
│   │   └── i18n/               # Language files (hi, ta, te, kn)
│   └── public/
│
├── server/                     # Node.js + Express
│   ├── routes/
│   │   ├── auth.js             # OTP + KYC endpoints
│   │   ├── policy.js           # Policy CRUD
│   │   ├── triggers.js         # Trigger monitoring + dispatch
│   │   └── payouts.js          # Payout processing
│   ├── services/
│   │   ├── weatherService.js   # OpenWeatherMap integration
│   │   ├── aqiService.js       # CPCB API integration
│   │   ├── fraudService.js     # Calls ML microservice
│   │   └── payoutService.js    # Razorpay sandbox calls
│   └── models/                 # PostgreSQL schemas
│
├── ml/                         # Python ML microservice
│   ├── risk_model.py           # Gradient Boost premium predictor
│   ├── fraud_model.py          # Fraud scorer
│   ├── train/                  # Training data (synthetic)
│   └── api.py                  # Flask API wrapper
│
└── README.md
```

---

## 👥 Team

> *Astrax*

- A Yash
- Mouriyan Gandhi 
- Jagadwikyat P
- Vyoam S Joshi
- Akshitha J Shah

---

## 🎤 One-Line Pitch

> *"NammaShield pays gig workers instantly when real-world disruptions cut their income — no claims, no platform dependency, no complexity."*

---

## 📎 Links

- 🎥 Demo Video: *(link to be added)*

---

*Built for Guidewire DEVTrails 2026 University Hackathon — Phase 1 Submission*
