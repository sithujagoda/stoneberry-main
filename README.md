# Ceylon Gem Marketplace 💎 — Next.js 16 & FastAPI Clean Architecture

![Ceylon Gem Marketplace Banner](https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200)

**An industry-grade, luxury B2B/B2C gemstone trading and digital marketplace specifically engineered for Sri Lankan gemstones (Sapphires, Rubies, Alexandrite, Padparadscha, Cat's Eye, and fine lapidary works).**

Connecting verified miners, master cutters, gemologists, and certified lapidary dealers with global gemstone buyers through real-time negotiation, interactive side-by-side gemstone comparison with precision loupe inspection, and mutual post-transaction reviews.

---

## ✨ Executive Feature Highlights

### 🔔 1. Global Notification Center & Real-Time Polling Alert Badge
- **Real-Time Notification Popover (`<Bell />` in `HeaderIcons.tsx`)**: Top-level interactive notification badge displaying live unread counts with background 15-second polling (`UserStoreProvider.tsx`), recent alert previews, and instant `"Mark all read"` actions.
- **Full-Page Notification Hub (`/notifications`)**: Tabbed notification dashboard supporting rapid filtering across `All`, `Unread`, `Selling Offers`, `Orders & Status`, `Messages`, and `Reviews` with single-click navigation direct to target resources.
- **Automated Event Triggers**: Instant alerts generated automatically upon purchase offer submission (`SELLING_OFFER`), order state progression (`BUYING_STATUS`), new chat messages (`NEW_MESSAGE`), and transaction feedback (`REVIEW_RECEIVED`).

### 👤 2. Public User Profiles & Platform-Wide Cross-Linking
- **Unified Public Profile View (`/user/[id]` & `/profile/user/[id]`)**: Comprehensive seller/buyer reputation page featuring verified identity badges (`Verified Seller / Member`), location, "Member since" timestamp, and reputation summary pills (**Overall Rating**, **Total Reviews**, **Active Listings**).
- **Interactive Inventory & Review Tabs**: Switch between live gemstone listings (`GemCard` grid) and complete review history (`GET /api/reviews/user/{id}`) with reviewer roles and star ratings.
- **Platform-Wide Cross-Linking**: One-click navigation to user profiles directly from Gem Detail pages (`Visit Profile`), negotiation rows (`Potential Buyer`), and active chat rooms (`View Partner Profile`).

### 🔍 3. Intelligent Gemstone Comparison & Dwell-Time Nudges
- **Interactive Side-by-Side Comparison (`/compare`)**: Compare up to **4 gemstones** simultaneously across comprehensive gemological specifications (Carat weight, Cut style, Shape, Color saturation, Clarity grade, Treatment history, Provenance, Dimensions, and Certification).
- **Precision Digital Loupe (`Loupe Magnifier`)**: Hover over any gemstone studio or natural sunlight image on the comparison screen to activate high-resolution magnifier inspection for facet precision and internal inclusions.
- **`Highlight Differences` Toggle**: Instantly filter and color-code specification differences across compared gemstones to accelerate buyer decision-making.
- **Dwell-Time Nudge Engine (`CompareProvider` & `CompareSuggestionPopup`)**: Autonomous session tracking that monitors how long buyers inspect individual gem detail pages. If a user views at least two distinct gemstones for `12+ seconds` each without comparing them, a luxury slide-in glassmorphism prompt suggests comparing them instantly.
- **Persistent Bottom Dock (`CompareTray`)**: Floating action dock showing selected gemstones across page navigation with quick removal or `Compare Now` navigation.

### 📸 4. Segmented Sunlight vs. Studio Media Switcher
- **Top Segmented Pill Toggle (`GemMediaViewer.tsx`)**: Easily switch between high-resolution `Sunlight Photo` (`gem.sunlight_image_url`) and `Studio Photo` views.
- **Bottom Media Gallery (`GemMediaList.tsx`)**: Secondary inspection views, video clips, and lab certificates docked clearly below the primary display.

### 🏛️ 5. Clean Architecture Backend (Layered Separation of Concerns)
- **API Layer (`backend/app/api/v1/endpoints/`)**: Pure REST HTTP controllers (`/auth`, `/users`, `/gems`, `/cart`, `/favorites`, `/purchases`, `/messages`, `/reviews`, `/notifications`) aggregated cleanly under `/api`.
- **Service Layer (`backend/app/services/`)**: Isolated business logic and SQLAlchemy ORM database operations (`auth_service`, `gem_service`, `notification_service`, etc.) decoupled from web transport frameworks.
- **Core Cross-Cutting Layer (`backend/app/core/`)**: Unified Pydantic `Settings` (`config.py`), central connection pool (`database.py`), Bcrypt/JWT security helpers (`security.py`), global exception handlers (`exceptions.py`), and real-time HTTP response time logging (`middleware.py`).
- **Resilient Startup & Backward Compatibility**: Protected database table checks at bootstrap preventing offline connection crashes (`psycopg2.OperationalError`) and proxy modules ensuring 100% legacy import parity.

### 🤝 6. End-to-End Negotiation & Inquiry Workflow
- **Structured Transaction State Machine**: `PENDING` (New Inquiry) $\rightarrow$ `INQUIRY` (Active Chat) $\rightarrow$ `READY_FOR_BUYING` (Terms Agreed) $\rightarrow$ `COMPLETED` (Verified Sale).
- **Real-Time Room Chat (`NegotiationChat.tsx`)**: Dedicated negotiation rooms (`/messages`) allowing buyers and sellers to discuss pricing, request custom certification, and trigger deal milestones.

### ⭐ 7. Dual Mutual Reputation System
- **Two-Way Reviews (`ReviewModal.tsx`)**: Upon transaction completion (`COMPLETED`), both buyers and sellers unlock the ability to rate and review each other with 1–5 star scores and written feedback (`BUYER_REVIEWING_SELLER` and `SELLER_REVIEWING_BUYER`).

### 🤖 8. AI-Powered Anti-Fraud Image Verification
- **EfficientNetB0 Deep Learning Model (`gemstone_detector_final.keras`)**: An embedded image classification model trained on 25,600+ gemstones to detect fake listings.
- **Live Frontend Validation (`/api/gems/validate-image`)**: Real-time intercept on `Dropzone` and `MultiDropzone` uploads that immediately blocks and rejects non-gemstone photos (like rocks, memes, or stock photos) with inline error feedback.
- **Strict API Gatekeeper**: Deep API-level validation that guarantees only authentic gemstone media enters the Supabase storage and marketplace catalog.

---

## 🛠️ Technology Stack & Architecture

```mermaid
graph TD
    Client["Client Browser (Next.js 16 App Router + React 19)"] <--> |JSON REST API + JWT Bearer| FastAPI["FastAPI API Gateway (main.py + api_router.py)"]
    
    subgraph Backend ["Backend Clean Architecture (Python 3.12+)"]
        FastAPI --> Endpoints["API Endpoints Layer (app/api/v1/endpoints/*.py)"]
        Endpoints --> Services["Service Layer (app/services/*.py)"]
        Services --> ORM["SQLAlchemy 2.0 ORM (app/models/*.py)"]
        Services --> CoreSec["Core Security (app/core/security.py)"]
        FastAPI --> CoreMid["Core Middleware & Handlers (app/core/exceptions.py)"]
    end
    
    ORM <--> |Connection Pool| Database[("Supabase PostgreSQL / SQLite")]
```

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Web App** | Next.js 16.2.9 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS v4, Lucide Icons |
| **Authentication** | NextAuth.js 4.24.14 (Credentials + Google OAuth), PyJWT (`HS256`), Bcrypt |
| **Backend API Server** | FastAPI 0.110+, Uvicorn, Python 3.12+, Pydantic v2 |
| **Database & ORM** | SQLAlchemy 2.0+, psycopg2-binary, Supabase Managed PostgreSQL (Production) / SQLite (Local) |
| **Machine Learning & AI** | TensorFlow 2.18, Keras (EfficientNetB0), Pillow (Image Preprocessing) |

---

## 🚀 Quick Start Guide (Local Running Instructions)

### 1. Prerequisites
- **Node.js** v20.x or higher & **npm**
- **Python** 3.12+

### 2. Backend Setup & Launch (`/backend`)
```bash
# 1. Navigate to project root and create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Configure Environment Variables (create backend/.env)
cat <<EOF > backend/.env
DATABASE_URL="sqlite:///./gem_marketplace.db"
# Or for Supabase PostgreSQL:
# DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
JWT_SECRET="your_secure_random_jwt_secret_key"
JWT_ALGORITHM="HS256"
EOF

# 4. Initialize Database & Seed Mock Data (Anura Rathnayake seller & test gems)
PYTHONPATH=. python backend/scripts/recreate_table.py
PYTHONPATH=. python backend/scripts/seed_db.py

# 5. Start the FastAPI Server with Hot Reload
PYTHONPATH=. uvicorn backend.app.main:app --reload --port 8000
```
- **FastAPI Interactive Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 3. Frontend Setup & Launch (`/frontend`)
Open a new terminal window:
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Configure Environment Variables (create frontend/.env.local)
cat <<EOF > .env.local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_key_change_me"
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
EOF

# 4. Launch Next.js 16 Development Server
npm run dev
```
- **Marketplace Web Portal**: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Container Deployment (Single-Command Launch)

You can launch both the **FastAPI Backend** (`gem-backend`) and optimized **Next.js 16 Standalone Frontend** (`gem-frontend`) simultaneously using **Docker Compose**. 

The configuration automatically loads your live **Supabase Managed PostgreSQL** connection (`DATABASE_URL`), **Supabase Storage credentials** (`SUPABASE_URL`, `SUPABASE_KEY`), and **Google OAuth keys** directly from your `backend/.env` and `frontend/.env.local` files:

> [!WARNING]
> **CRITICAL: Port Conflict Troubleshooting (`bind: address already in use`)**  
> If you encounter an error like `listen tcp 0.0.0.0:3000: bind: address already in use` or `0.0.0.0:8000` when running `docker compose up`, your local development processes (`npm run dev` or `uvicorn`) are actively running on host ports `3000` or `8000`.  
> **Resolution:** Stop any running `npm run dev` or `uvicorn` terminal processes (`CTRL+C` or `kill -9 $(lsof -t -i:3000)` / `kill -9 $(lsof -t -i:8000)`) before launching Docker containers.

```bash
# 1. Stop local host servers if running, then build and start containers in detached mode
docker compose up --build -d

# 2. Check container health & status
docker compose ps
docker compose logs -f backend
```
- **Marketplace Frontend (Dockerized)**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend (Dockerized)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Repository Directory Guide

```
gem/
├── README.md                      # Executive Summary & Quick Start (This File)
├── DOCUMENTATION.md               # Exhaustive Technical & Architectural Reference
├── ai/                            # Machine Learning Workspaces
│   ├── notebooks/                 # Jupyter Notebooks (Data Analysis & Model Training)
│   └── scripts/                   # Dataset Preparation Scripts
├── backend/
│   ├── app/
│   │   ├── ai_models/             # Production Keras Deep Learning Models (gemstone_detector_final.keras)
│   │   ├── api/v1/endpoints/      # API Controllers (auth, users, gems, cart, favorites, purchases, messages, reviews, notifications)
│   │   ├── services/              # Pure Domain Logic (auth, gem, purchase, message, review, notification, ai services)
│   │   ├── core/                  # Unified Config, Database Engine, Security & Middleware
│   │   ├── models/                # SQLAlchemy Entities (User, Gem, PurchaseRequest, Message, Review, Notification, Cart, Favorite)
│   │   ├── schemas/               # Pydantic DTO Validation Models
│   │   └── main.py                # Resilient Bootstrap & Route Registration
│   ├── scripts/                   # Database Utilities (seed_db.py, recreate_table.py, test_db.py)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/                   # Next.js 16 Pages (/gems, /compare, /notifications, /user/[id], /messages, /sell, /profile)
    │   ├── components/            # UI Elements (UserStoreProvider, HeaderIcons, GemMediaViewer, CompareProvider, GemCard, NegotiationChat)
    │   ├── types/                 # TypeScript Types & Interfaces
    │   └── middleware.ts          # Route Protections & Onboarding Enforcement
    └── package.json
```

---

## 📖 Complete Technical Documentation

For in-depth architectural specifications, complete database schemas, data dictionaries, API payloads, negotiation state diagrams, and detailed breakdowns of every component, consult our comprehensive documentation:
👉 **[View Full Technical Documentation (DOCUMENTATION.md)](file:///Users/sihanedward/Desktop/gem/DOCUMENTATION.md)**
