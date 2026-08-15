# Ceylon Gem Marketplace — System Architecture & Comprehensive Technical Documentation

*Last Updated: July 2026*  
*Version: 2.1.0 (Global Notification Hub, Public User Profiles, & Platform-Wide Cross-Linking Release)*

---

## 1. Executive Summary & Platform Overview

The **Ceylon Gem Marketplace** is an industry-grade, specialized digital trading platform engineered for Sri Lankan gemstones (Sapphires, Rubies, Alexandrite, Padparadscha, Cat's Eye, and precision lapidary creations). It unites verified miners, master cutters, gemologists, lapidary specialists, and certified gemstone dealers with buyers across the globe.

### Core Architectural Pillars & Features:
1. **Precision Gemological Specifications**: Deep data structures capturing provenance (e.g., Ratnapura, Ceylon), treatment history (Unheated / Natural, Heated), dimensions ($L \times W \times H$ in mm), exact carat weight, color intensity saturation, facet cut styles, and lab certifications (GIA, NGJA, CGL).
2. **Global Notification Center & Real-Time Polling Engine**: Persistent event alerts (`Notification` model) automatically triggered across core workflows: purchase inquiry submission (`SELLING_OFFER`), transaction status advances (`BUYING_STATUS`), chat messages (`NEW_MESSAGE`), and review submissions (`REVIEW_RECEIVED`). Features a 15-second background polling engine inside `UserStoreProvider.tsx` feeding the top navigation Bell (`<Bell />`) popover and full-page `/notifications` filtering hub.
3. **Public User Profiles & Platform-Wide Cross-Linking**: Unified public reputation pages (`/user/[id]` & `/profile/user/[id]`) showcasing verified badges (`Verified Seller / Member`), location details, member since timestamps, reputation stats pills (**Overall Rating**, **Total Reviews**, **Active Listings**), active inventory (`GemCard` grid tab), and full review feedback history (`GET /api/reviews/user/{id}`). Clickable cross-linking is established across Gem Detail cards (`/gems/[id]`), Selling Dashboard negotiation rows (`/profile/selling`), and active chat headers (`/messages`).
4. **Interactive Side-by-Side Comparison & Dwell-Time Nudges**: An intelligent, autonomous comparison suite (`CompareProvider`, `CompareSuggestionPopup`, `CompareTray`, `/compare`) featuring dwell-time tracking (`viewHistory`) and high-resolution loupe magnification to assist buyers in evaluating gemstone quality side-by-side.
5. **Segmented Sunlight vs. Studio Media Switcher**: Refactored `GemMediaViewer.tsx` top-level segmented pill toggle separating primary `Sunlight Photo` vs. `Studio Photo` (or cover photo), with secondary inspection angles, video clips, and lab certificates cleanly docked inside the bottom thumbnail gallery (`GemMediaList.tsx`).
6. **Structured B2B/B2C Inquiry & Negotiation State Machine**: Direct room-based negotiation workflows (`PENDING` $\rightarrow$ `INQUIRY` $\rightarrow$ `READY_FOR_BUYING` $\rightarrow$ `COMPLETED`) enabling buyers and sellers to discuss custom terms, certification requests, and pricing in real time (`NegotiationChat.tsx`).
7. **Dual-Party Mutual Reputation System**: Two-way review mechanics where buyers rate sellers (`BUYER_REVIEWING_SELLER`) and sellers rate buyers (`SELLER_REVIEWING_BUYER`) after completed transactions.
8. **Layered Clean Backend Architecture**: Strict separation of concerns decoupling HTTP web presentation (`app/api/v1/endpoints`), business logic and queries (`app/services`), data models (`app/models`), and cross-cutting concerns (`app/core`).
9. **AI-Powered Anti-Fraud Image Verification**: An integrated deep learning system (`EfficientNetB0`) trained on 25,600+ gemstones. It operates as a Singleton service, blocking fraudulent or non-gemstone images in real-time during frontend drag-and-drop actions.

---

## 2. System Architecture & Tech Stack

```mermaid
graph TD
    Client["Client Layer (Next.js 16 App Router + React 19 + Tailwind v4)"]
    
    subgraph FrontendState ["Frontend State & Contexts"]
        Client --> NextAuth["NextAuth.js v4 (JWT & Google OAuth)"]
        Client --> CompCtx["CompareProvider.tsx (Dwell Tracker & localStorage)"]
        Client --> UserStore["UserStoreProvider.tsx (Favorites, Cart, & 15s Notification Polling)"]
    end
    
    Client <--> |REST / JSON over HTTP + Bearer Token| APIGateway["FastAPI Gateway (app/main.py + app/api/v1/api_router.py)"]
    
    subgraph BackendCleanArch ["Backend Clean Architecture (FastAPI + Python 3.12+)"]
        APIGateway --> Endpoints["API Layer (app/api/v1/endpoints/*.py)"]
        
        subgraph Services ["Service Layer (app/services/)"]
            Endpoints --> AuthService["auth_service.py"]
            Endpoints --> GemService["gem_service.py"]
            Endpoints --> AIService["ai_service.py (TensorFlow EfficientNetB0)"]
            Endpoints --> CartService["cart_service.py"]
            Endpoints --> FavService["favorite_service.py"]
            Endpoints --> PurchService["purchase_service.py"]
            Endpoints --> MsgService["message_service.py"]
            Endpoints --> RevService["review_service.py"]
            Endpoints --> NotifService["notification_service.py"]
        end
        
        subgraph Core ["Core Cross-Cutting Layer (app/core/)"]
            APIGateway --> Mid["middleware.py (X-Response-Time Logger)"]
            APIGateway --> Exc["exceptions.py (Global Handlers)"]
            Services --> DB["database.py (Engine & SessionLocal)"]
            Services --> Sec["security.py (JWT & Bcrypt)"]
            DB --> Config["config.py (Unified pydantic-settings)"]
        end
        
        Services --> Models["SQLAlchemy 2.0 ORM Entities (app/models/*.py)"]
        AIService --> ModelFiles["Keras Models (app/ai_models/*.keras)"]
    end
    
    Models <--> |Connection Pool| Postgres[("Supabase Managed PostgreSQL / Local SQLite")]
```

### 2.1 Technology Stack Matrix

| Layer | Technologies & Libraries | Responsibilities & Architectural Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.2.9** (App Router), **React 19.2.4**, **TypeScript 5** | Server-side rendering (SSR), client-side interactive widgets, file-system routing, and route protections. |
| **UI & Styling** | **Tailwind CSS v4**, **Headless UI v2.2**, **Lucide React**, **Heroicons** | Responsive glassmorphism aesthetics, dynamic sliders, modals, tooltips, and precision loupe containers. |
| **Frontend Auth & State** | **NextAuth.js 4.24.14**, **React Context (`CompareProvider`)** | Credentials and Google OAuth authentication session management, dwell-time tracking, and `localStorage` persistence. |
| **Backend API Gateway** | **FastAPI 0.110+**, **Uvicorn 0.28+**, **Python 3.12+** | High-concurrency async REST API, automated Swagger/OpenAPI docs (`/docs`), and clean API routing (`/api`). |
| **Core & Services Layer** | **SQLAlchemy 2.0+**, **Pydantic 2.6+**, **pydantic-settings 2.2+** | Isolated domain business logic (`app/services/`), type-safe DTO validation (`app/schemas/`), and environment config management (`app/core/config.py`). |
| **Machine Learning & AI** | **TensorFlow 2.18**, **Keras (EfficientNetB0)**, **Pillow** | Production image classification (`gemstone_detector_final.keras`) integrated as a Lazy-Loaded Singleton to prevent boot delay. |
| **Security & Auth** | **PyJWT 2.8+**, **Bcrypt 4.1+** | Password hashing (`security.hash_password`), JWT encoding/decoding (`HS256`), and bearer token dependencies (`app/api/deps.py`). |
| **Database & Drivers** | **psycopg2-binary 2.9.9**, **SQLite 3** | Connection pooling to cloud Supabase PostgreSQL instances (`aws-0-ap-southeast-1.pooler.supabase.com`) or local SQLite fallback. |

---

## 3. Project Directory & Workspace Structure

```
gem/
├── README.md                           # Executive Summary & Quick Start
├── DOCUMENTATION.md                    # Comprehensive System Documentation (This File)
├── ai/                                 # Machine Learning Workspaces
│   ├── notebooks/                      # Jupyter Notebooks (Data Analysis & Model Training)
│   └── scripts/                        # Dataset Preparation Scripts
├── backend/
│   ├── app/
│   │   ├── ai_models/                  # Production Keras Deep Learning Models (gemstone_detector_final.keras)
│   │   ├── api/                        # API Presentation Layer
│   │   │   ├── deps.py                 # Dependency Injection (get_db, get_current_user)
│   │   │   └── v1/
│   │   │       ├── api_router.py       # Aggregated Router (mounts all v1 endpoints under /api)
│   │   │       └── endpoints/          # Focused HTTP Route Handlers
│   │   │           ├── auth.py             # /api/auth (Register, Login, Onboarding, Profile)
│   │   │           ├── users.py            # /api/users (Public user profile & reputation summary)
│   │   │           ├── gems.py             # /api/gems (Catalog listing, filter, create, delete)
│   │   │           ├── cart.py             # /api/cart (Add, remove, checkout)
│   │   │           ├── favorites.py        # /api/favorites (Wishlist toggle & queries)
│   │   │           ├── purchases.py        # /api/purchases (Inquiry state transitions)
│   │   │           ├── messages.py         # /api/messages (Room chat history & sending)
│   │   │           ├── reviews.py          # /api/reviews (Mutual rating submission & listing)
│   │   │           └── notifications.py    # /api/notifications (Event alerts & read receipt endpoints)
│   │   ├── services/                   # Pure Domain & Database Query Logic
│   │   │   ├── auth_service.py             # User registration, login, onboarding, unread counts
│   │   │   ├── gem_service.py              # Filtered queries, seller gems, CRUD operations
│   │   │   ├── cart_service.py             # Cart item management & checkout flows
│   │   │   ├── favorite_service.py         # Wishlist toggling & queries
│   │   │   ├── purchase_service.py         # Inquiry creation, status updates (`READY_FOR_BUYING`)
│   │   │   ├── message_service.py          # Negotiation thread messaging
│   │   │   ├── review_service.py           # Rating calculation & review creation
│   │   │   └── notification_service.py     # Event dispatching across offers, statuses, and chats
│   │   ├── core/                       # Cross-Cutting Infrastructure
│   │   │   ├── config.py                   # Pydantic BaseSettings (DATABASE_URL, JWT, Supabase)
│   │   │   ├── database.py                 # SQLAlchemy Engine & SessionLocal
│   │   │   ├── security.py                 # Bcrypt hashing & JWT verification functions
│   │   │   ├── exceptions.py               # Global 404/401/422/500 structured JSON error handlers
│   │   │   └── middleware.py               # HTTP response time logging (X-Response-Time)
│   │   ├── models/                     # SQLAlchemy Declarative ORM Models
│   │   │   ├── user.py                     # User profile, business registration & roles
│   │   │   ├── gem.py                      # Gemstone specifications & pricing
│   │   │   ├── purchase_request.py         # Negotiation workflow entity
│   │   │   ├── message.py                  # Room chat messages
│   │   │   ├── review.py                   # Mutual reviews & ratings
│   │   │   ├── notification.py             # Persistent user event alerts & navigation links
│   │   │   ├── cart.py                     # Shopping cart items
│   │   │   └── favorite.py                 # User favorite gems
│   │   ├── schemas/                    # Pydantic DTO Request/Response Schemas
│   │   │   ├── user.py, gem.py, purchase_request.py, message.py, review.py, notification.py
│   │   ├── utils/                      # Helper & Storage Shims
│   │   │   ├── auth.py                     # Shim proxying core/config.py settings
│   │   │   └── storage.py                  # Supabase Storage client & file uploader
│   │   ├── controllers/                # Backward Compatibility Proxies
│   │   │   └── *_controller.py             # Re-exports endpoints/*.router for legacy imports
│   │   ├── database.py                 # Shim re-exporting core/database.py
│   │   ├── dependencies.py             # Shim re-exporting api/deps.py
│   │   └── main.py                     # Concise FastAPI Bootstrap, Middleware & Router Mounting
│   ├── scripts/                        # Database Maintenance & Seeding Utilities
│   │   ├── seed_db.py                      # Seeds Anura Rathnayake seller & mock gems
│   │   ├── recreate_table.py               # Drops and recreates all database tables cleanly
│   │   └── test_db.py                      # Database connection & column verification script
│   └── requirements.txt                # Python Dependencies Manifest
│
│── frontend/
│   ├── src/
│   │   ├── app/                        # Next.js 16 App Router Pages
│   │   │   ├── api/auth/[...nextauth]/     # NextAuth Configuration Route
│   │   │   ├── cart/                       # Shopping Cart Portal
│   │   │   ├── favorites/                  # Saved Wishlist Portal
│   │   │   ├── compare/                    # Side-by-Side Gemstone Comparison & Loupe Page
│   │   │   ├── notifications/              # Global Notification Hub with category filters
│   │   │   ├── user/[id]/                  # Public User Profile & Reputation View
│   │   │   ├── gems/
│   │   │   │   ├── [id]/                   # Gem Detail Page (Sunlight/Studio views & cross-links)
│   │   │   │   └── browse/                 # Advanced Catalog Search Page
│   │   │   ├── login/, register/           # Authentication Portals
│   │   │   ├── messages/                   # Negotiation Rooms & Partner Profile Links
│   │   │   ├── onboarding/                 # Mandatory Seller/Buyer Regulatory Onboarding
│   │   │   ├── profile/                    # User Profile, Store & Selling Dashboard
│   │   │   ├── sell/                       # Step-by-Step Gemstone Listing Creation
│   │   │   ├── layout.tsx                  # Root Layout with Navigation & Providers
│   │   │   └── page.tsx                    # Landing & Discovery Hero Page
│   │   ├── components/                 # Reusable UI & Application Components
│   │   │   ├── UserStoreProvider.tsx       # Favorites, Cart, & 15s polling notification store
│   │   │   ├── HeaderIcons.tsx             # Top navigation icons & interactive Bell popover
│   │   │   ├── GemMediaViewer.tsx          # Segmented Sunlight vs. Studio photo switcher
│   │   │   ├── CompareProvider.tsx         # Dwell-time tracker & comparison list context
│   │   │   ├── CompareSuggestionPopup.tsx  # Slide-in intelligent suggestion notification
│   │   │   ├── CompareTray.tsx             # Floating bottom comparison dock
│   │   │   ├── GemCard.tsx                 # Gemstone display card with compare toggle
│   │   │   ├── NegotiationChat.tsx         # Real-time interactive chat room
│   │   │   ├── ReviewModal.tsx             # Star rating submission modal
│   │   │   ├── ShapeSelector.tsx, IntensitySelector.tsx, DualRangeSlider.tsx
│   │   ├── types/                      # TypeScript Interface Declarations
│   │   └── middleware.ts               # Route Protections & Onboarding Enforcer
│   ├── package.json
│   └── next.config.ts
```

---

## 4. Deep-Dive: The Intelligent Comparison Feature Suite (`/compare`)

The gemstone comparison ecosystem empowers buyers to conduct meticulous technical analysis across up to **4 gemstones** simultaneously. It combines React Context state management, local session dwell-time heuristics, and interactive optical inspection.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Buyer
    participant Page as /gems/[id] (Detail Page)
    participant Ctx as CompareProvider (Context)
    participant LS as localStorage (gem_view_history)
    participant Popup as CompareSuggestionPopup
    participant Compare as /compare (Side-by-Side Screen)

    Buyer->>Page: Visits Gemstone A (/gems/1)
    Page->>Ctx: recordView(GemA, dwellSeconds=25s)
    Ctx->>LS: Saves Gem A dwell history (25s)
    Buyer->>Page: Navigates to Gemstone B (/gems/2)
    Page->>Ctx: recordView(GemB, dwellSeconds=14s)
    Ctx->>LS: Saves Gem B dwell history (14s)
    
    Note over Ctx: Dwell Tracker Check:<br/>Gem B >= 12s AND Gem A >= 20s AND not dismissed
    Ctx->>Popup: setSuggestedPair({ gemA, gemB })
    Popup-->>Buyer: Slides in luxury glassmorphic notification prompt:<br/>"Compare the gems you've been viewing?"
    
    alt Click "Compare Now"
        Buyer->>Popup: Click "Compare Now"
        Popup->>Ctx: acceptSuggestion() -> adds Gem A & Gem B to compareItems
        Ctx->>Compare: router.push("/compare")
        Compare-->>Buyer: Displays side-by-side specs + precision Loupe magnifier
    else Click "Dismiss"
        Buyer->>Popup: Click "Dismiss (X)"
        Popup->>Ctx: dismissSuggestion() -> sets gem_compare_prompt_dismissed = "true"
        Ctx->>LS: Saves dismissal flag to prevent future interruptions
    end
```

### 4.1 Component & Architecture Breakdown

#### 1. `CompareProvider.tsx` (`src/components/CompareProvider.tsx`)
- **State Management**: Maintains `compareItems` (array of `Gem` objects, max 4) and exposes `toggleCompare`, `removeFromCompare`, `clearCompare`, and `isInCompare`.
- **Storage Persistence**: Synchronizes items cleanly to browser `localStorage` (`gem_compare_storage`) so selections persist across browser refreshes and tab navigation.
- **Dwell-Time Tracking (`recordView`)**: Every time a user views a gemstone detail page, `recordView(gem, dwellSeconds)` updates `localStorage.getItem("gem_view_history")`.
- **Intelligent Nudge Engine**: If a user inspects the current gemstone (Gem B) for at least `12 seconds`, the provider scans `gem_view_history` for any previously inspected gemstone (Gem A) viewed for `20+ seconds`. If found, and if the user hasn't dismissed the prompt (`gem_compare_prompt_dismissed != "true"`), it triggers `suggestedPair = { gemA, gemB }`.

#### 2. `CompareSuggestionPopup.tsx` (`src/components/CompareSuggestionPopup.tsx`)
- A non-intrusive, glassmorphic notification banner positioned fixed at the top right (`top-24 right-6 z-[9500]`).
- Features thumbnails of both suggested gems, their names, and two action buttons:
  - **`Compare Now`**: Calls `acceptSuggestion()`, automatically inserts both gems into `compareItems`, clears the popup, and navigates to `/compare`.
  - **`Dismiss`**: Calls `dismissSuggestion()`, immediately closes the popup, and writes `"true"` to `gem_compare_prompt_dismissed` in `localStorage` so the user is never prompted again during their work.

#### 3. `CompareTray.tsx` (`src/components/CompareTray.tsx`)
- A floating bottom dock (`fixed bottom-6 left-1/2 -translate-x-1/2 z-[8888]`) visible on all catalog and browse pages whenever `compareItems.length > 0`.
- Displays miniature circular image avatars of selected gems, individual removal `[X]` buttons, a `"Clear All"` action, and a prominent `"Compare Now ->"` navigation button showing `(X of 4 selected)`.

#### 4. Side-by-Side Inspection Page (`src/app/compare/page.tsx`)
- **`Highlight Differences` Toggle**: When toggled, dynamically inspects every row (Carat Weight, Price, Color, Clarity, Treatment, Origin, Dimensions, Shape, Cut Style, Certification) across all active columns. Cells with differing values are highlighted with an amber/gold border and glowing accent (`border-[#B87A5B]/40 bg-[#B87A5B]/10`) so buyers can spot variance instantly.
- **Precision Optical Loupe Magnifier**:
  - Hovering over any gemstone image (`sunlight_image_url` or `studio_image_url`) activates a `140px x 140px` circular magnification loupe (`activeLoupeId`).
  - Calculates exact relative mouse coordinates (`loupePos.x`, `loupePos.y`) and scales the underlying high-resolution image background by `2.5x` (`backgroundSize: "${rect.width * 2.5}px ${rect.height * 2.5}px"`).
  - Enables buyers and lapidary experts to inspect facet geometry, color zoning, and internal inclusions precisely as if using a jeweler's 10x hand loupe.

---

## 5. Database Entity-Relationship Architecture

### 5.1 ER Diagram

```mermaid
erDiagram
    users ||--o{ gems : lists
    users ||--o{ purchase_requests : buyer_or_seller
    users ||--o{ messages : sends_or_receives
    users ||--o{ reviews : writes_or_receives
    users ||--o{ notifications : receives
    users ||--o{ cart_items : has
    users ||--o{ favorites : saves

    gems ||--o{ purchase_requests : subject_of
    gems ||--o{ cart_items : added_to
    gems ||--o{ favorites : bookmarked_in

    purchase_requests ||--o{ messages : contains_chat
    purchase_requests ||--o| reviews : triggers_rating
```

### 5.2 Data Dictionary

#### 1. `users` Table
- `id` (PK, Integer): Unique identifier.
- `email` (String, Unique, Indexed): User email address.
- `hashed_password` (String, Nullable): Bcrypt hashed password (nullable for OAuth accounts).
- `firstname`, `lastname`, `mobilenumber`, `address`, `province`, `city` (String, Nullable): Personal details.
- `seller_type` (String, Nullable): E.g., Individual, Miner, Lapidary, Certified Gem Dealer.
- `business_name`, `business_registration_number` (String, Nullable): Regulatory business registration.
- `provider` (String, Default: `"credentials"`): Identity provider (`"credentials"` or `"google"`).
- `is_complete` (Boolean, Default: `False`): Flag indicating if mandatory onboarding (`/onboarding`) is finished.
- `created_at` (DateTime): Record creation timestamp.

#### 2. `gems` Table
- `id` (PK, Integer): Unique gemstone identifier.
- `name` (String, Indexed): Headline display title.
- `gemstone_type` (String): Variety (e.g., Sapphire, Ruby, Alexandrite, Padparadscha).
- `category` (String): Trade classification category.
- `cut_style` (String): Facet pattern (e.g., Brilliant, Step Cut, Mixed Cut, Cabochon).
- `treatment` (String): Treatment status (e.g., Unheated / Natural, Heated).
- `shape` (String): Cut contour (e.g., Oval, Cushion, Round, Emerald, Pear).
- `color`, `clarity`, `intensity` (String): Color hue, eye-cleanliness, and saturation intensity.
- `month`, `origin` (String): Birthstone month and provenance (e.g., Ratnapura, Ceylon).
- `length`, `width`, `height` (Float): Physical dimensions in millimeters.
- `weight_carat` (Float): Weight in metric carats.
- `price_usd` (Float): Asking price in USD.
- `mined`, `cut_by`, `cut_location`, `certified_by`, `certified_location` (String): Authorities and provenance.
- `sunlight_image_url`, `studio_image_url`, `extra_media_url`, `certificate_url` (String): Media URLs.
- `is_available` (Boolean, Default: `True`): Marketplace availability.
- `seller_id` (FK $\rightarrow$ `users.id`): Owner/Seller user ID.

#### 3. `purchase_requests` Table
- `id` (PK, Integer): Inquiry/Transaction ID.
- `gem_id` (FK $\rightarrow$ `gems.id`): Target gemstone ID.
- `buyer_id`, `seller_id` (FK $\rightarrow$ `users.id`): Buyer and seller user IDs.
- `status` (String/Enum): State progression (`PENDING`, `INQUIRY`, `READY_FOR_BUYING`, `COMPLETED`, `SELLER_REJECTED`, `BUYER_REJECTED`).
- `rejection_reason` (Text, Nullable): Reason if declined.
- `buyer_has_unread_updates`, `seller_has_unread_updates` (Boolean): Notification flags.

#### 4. `messages` Table
- `id` (PK, Integer): Message ID.
- `purchase_request_id` (FK $\rightarrow$ `purchase_requests.id`): Associated negotiation room.
- `sender_id`, `receiver_id` (FK $\rightarrow$ `users.id`): Sender and recipient user IDs.
- `content` (Text): Message text.
- `is_read` (Boolean, Default: `False`): Read receipt flag.

#### 5. `reviews` Table
- `id` (PK, Integer): Review ID.
- `purchase_request_id` (FK $\rightarrow$ `purchase_requests.id`): Transaction reference.
- `target_user_id`, `reviewer_id` (FK $\rightarrow$ `users.id`): Target and author user IDs.
- `review_type` (String/Enum): Either `"BUYER_REVIEWING_SELLER"` or `"SELLER_REVIEWING_BUYER"`.
- `rating` (Integer): Rating score from 1 to 5 stars.
- `comment` (Text): Written feedback text.

#### 6. `notifications` Table
- `id` (PK, Integer): Notification alert ID.
- `user_id` (FK $\rightarrow$ `users.id`): Target recipient user ID.
- `type` (String/Enum): Event classification (`SELLING_OFFER`, `BUYING_STATUS`, `NEW_MESSAGE`, `REVIEW_RECEIVED`, `SYSTEM`).
- `title` (String): Alert headline.
- `message` (Text): Detailed event description.
- `link_url` (String): Click navigation target path (e.g., `/profile/selling`, `/messages?thread=XX`).
- `is_read` (Boolean, Default: `False`): Read status indicator.
- `related_id` (Integer, Nullable): Associated resource reference ID (`purchase_request.id` or `review.id`).
- `created_at` (DateTime): Timestamp when triggered.

#### 7. `cart_items` & `favorites` Tables
- Store user cart items (`user_id`, `gem_id`, `created_at`) and wishlist favorites (`user_id`, `gem_id`, `created_at`).

---

## 6. Backend API Reference (`/api`)

### 6.1 Endpoints Inventory

#### AI & Image Validation
- **`POST /api/gems/validate-image`**: Receives raw multipart form data (the physical image file bytes) from the frontend `Dropzone`. Forwards bytes directly into the `GemstoneDetector` service for real-time validation without saving to disk. Returns `{"is_gemstone": true/false}`.

#### Authentication & Core
All backend endpoints are aggregated under `/api` in `app/api/v1/api_router.py` and return a standardized response envelope:
```json
{
  "success": true,
  "error": null,
  "data": { ... },
  "resolution": "Actionable instructions or guidance if applicable."
}
```

### 6.1 Endpoints Inventory

| Router Prefix | HTTP Method & Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth` | `POST /register` | Public | Register new user account with credentials. |
| `/api/auth` | `POST /login` | Public | Authenticate user and return JWT bearer token. |
| `/api/auth` | `POST /social-login` | Public | Authenticate Google OAuth token and issue JWT. |
| `/api/auth` | `GET /me` | Protected | Retrieve authenticated user profile (`get_current_user`). |
| `/api/auth` | `PUT /onboarding` | Protected | Complete account onboarding (`is_complete = True`). |
| `/api/auth` | `PUT /me` | Protected | Update personal details, contact info, or business registration. |
| `/api/auth` | `POST /profile-image` | Protected | Upload profile avatar to Supabase and update user record. |
| `/api/users` | `GET /{user_id}` | Public | Retrieve public profile summary (`PublicUserResponse`) including seller ratings and verification status. |
| `/api/gems` | `GET ""` | Public | List & filter available gems (`type`, `color`, `shape`, `minCarat`, `maxCarat`, `search`). |
| `/api/gems` | `GET /{gem_id}` | Public | Fetch detailed gem specifications by ID. |
| `/api/gems` | `GET /seller/{seller_id}` | Public | Retrieve all gems listed by a specific seller. |
| `/api/gems` | `POST ""` | Protected | Create a new gemstone listing with multipart form data & media upload. |
| `/api/gems` | `PUT /{gem_id}` | Protected | Update an existing gemstone listing (seller only). |
| `/api/gems` | `DELETE /{gem_id}` | Protected | Remove a gemstone listing (seller only). |
| `/api/purchases` | `POST ""` | Protected | Create a new purchase inquiry for a gem (`PENDING` status). |
| `/api/purchases` | `GET /buying/{user_id}` | Protected | List all buying requests initiated by the user. |
| `/api/purchases` | `GET /selling/{user_id}` | Protected | List all selling requests received by the seller. |
| `/api/purchases` | `PATCH /{request_id}/status` | Protected | Advance negotiation status (`INQUIRY` $\rightarrow$ `READY_FOR_BUYING`). |
| `/api/purchases` | `POST /{request_id}/complete` | Protected | Complete transaction (`COMPLETED`) and unlock reviews. |
| `/api/messages` | `GET /request/{purchase_id}` | Protected | Fetch chat room history for a negotiation thread. |
| `/api/messages` | `POST ""` | Protected | Send a chat message in a negotiation room. |
| `/api/reviews` | `POST /` | Protected | Submit a star rating & review for a completed deal. |
| `/api/reviews` | `GET /user/{user_id}` | Public | Fetch all reviews received by a user along with average rating. |
| `/api/notifications` | `GET ""` | Protected | Retrieve paginated notification alerts and total unread count. |
| `/api/notifications` | `POST /{id}/read` | Protected | Mark a single notification alert as read (`is_read = True`). |
| `/api/notifications` | `POST /read-all` | Protected | Bulk mark all unread alerts as read for the authenticated user. |
| `/api/cart` | `GET /user/{user_id}` / `POST /add` / `DELETE /{user_id}/{gem_id}` | Protected | Retrieve, add, or remove shopping cart items. |
| `/api/favorites`| `GET /user/{user_id}` / `POST /toggle` | Protected | Retrieve or toggle gemstone wishlist favorites. |

### 6.2 Global Middleware & Error Handling (`app/core/`)
- **`log_response_time` (`app/core/middleware.py`)**: Intercepts every HTTP request, calculates exact execution latency using `time.perf_counter()`, logs details to `gem-marketplace` logger, and injects `X-Response-Time: XX.XXms` header.
- **`http_exception_handler` (`app/core/exceptions.py`)**: Intercepts FastAPI `HTTPException` and returns standardized JSON with tailored `resolution` guidance.
- **`validation_exception_handler` (`app/core/exceptions.py`)**: Intercepts `RequestValidationError` (HTTP 422) and formats detailed field-level validation errors.
- **`generic_exception_handler` (`app/core/exceptions.py`)**: Catches unexpected internal exceptions (HTTP 500) and provides connection troubleshooting steps without exposing sensitive stack traces to clients.

---

## 7. Frontend Architecture & User Workflows

### 7.1 Routing & Route Enforcement (`middleware.ts`)
Next.js middleware enforces strict compliance guards:
- **Public Routes**: `/`, `/login`, `/register`, `/gems`, `/gems/[id]`, `/compare`, `/user/[id]`, `/profile/user/[id]`, `/api/*`, static assets.
- **Onboarding Enforcement**: If a logged-in user has `is_complete === false`, attempting to visit protected routes (`/sell`, `/messages`, `/profile`, `/notifications`) automatically redirects them to `/onboarding`. Once `is_complete === true`, visiting `/onboarding` redirects back to `/`.

### 7.2 Page & Workflow Inventory
- **`/` (`page.tsx`)**: Landing banner, quick search filters, featured gemstones, and value propositions.
- **`/gems` (`gems/page.tsx`)**: Searchable marketplace catalog supporting multi-variable filter combinations (Cut shape, Carat weight, Price range, Color intensity, Treatment, Origin).
- **`/gems/[id]` (`gems/[id]/page.tsx`)**: High-fidelity gemstone detail view featuring the **Segmented Sunlight vs. Studio Media Switcher**, lab certificate inspection gallery (`GemMediaList.tsx`), clickable seller avatar/name & `"Visit Profile"` links (`/user/${sellerId}`), and action triggers (`"Start Inquiry / Buy Now"`, `"Compare"`, `"Add to Cart"`, `"Save to Favorites"`).
- **`/user/[id]` & `/profile/user/[id]` (`user/[id]/page.tsx`)**: Unified public user profile displaying verified badges (`Verified Seller / Member`), location, member since timestamp, reputation stats pills (**Overall Rating**, **Total Reviews**, **Active Listings**), active inventory (`GemCard` grid tab), and complete review feedback history (`GET /api/reviews/user/{id}`).
- **`/compare` (`compare/page.tsx`)**: Side-by-side gemstone comparison screen with differences highlighting and precision loupe magnification.
- **`/notifications` (`notifications/page.tsx`)**: Full-page Global Notification Hub offering tabbed filtering (`All`, `Unread`, `Selling Offers`, `Orders & Status`, `Messages`, `Reviews`) and one-click read navigation (`POST /api/notifications/{id}/read`).
- **`/sell` (`sell/page.tsx`)**: Step-by-step seller portal to list gemstones with exact metrics, provenance, pricing, and media uploads.
- **`/messages` (`messages/page.tsx`)**: Centralized negotiation dashboard enabling buyers and sellers to inspect open purchase inquiries and negotiate via real-time messaging (`NegotiationChat.tsx`). Includes direct `View Partner Profile` cross-linking in the chat room header.
- **`/profile` (`profile/page.tsx`)**: Account management, seller store overview (`/profile/selling` with direct buyer profile links), and received reputation reviews.

---

## 8. End-to-End Negotiation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Buyer initiates Inquiry (`/gems/[id]`)
    PENDING --> INQUIRY: Seller responds to Inquiry
    PENDING --> SELLER_REJECTED: Seller declines Inquiry
    INQUIRY --> READY_FOR_BUYING: Parties agree on terms (`Mark Ready for Buying`)
    INQUIRY --> BUYER_REJECTED: Buyer withdraws inquiry
    READY_FOR_BUYING --> COMPLETED: Payment & delivery verified (`Complete Transaction`)
    COMPLETED --> [*]: Both parties submit Reviews (`ReviewModal.tsx`)
```

1. **Inquiry (`PENDING`)**: Buyer clicks `"Start Inquiry / Buy Now"`. A `PurchaseRequest` record is created.
2. **Negotiation (`INQUIRY`)**: Both parties communicate in `NegotiationChat.tsx`.
3. **Agreement (`READY_FOR_BUYING`)**: Seller clicks `Mark Ready for Buying` when pricing and terms are finalized.
4. **Completion (`COMPLETED`)**: Buyer or seller confirms fulfillment by clicking `Complete Transaction`. The gem listing turns `is_available = False`.
5. **Reputation Feedback**: Both parties unlock `ReviewModal.tsx` to rate each other 1–5 stars.

---

## 9. Comprehensive Local Development & Execution Guide

Follow these exact steps to run the complete Ceylon Gem Marketplace application locally from scratch.

### 9.1 Prerequisites
- **Node.js** (v20.x or newer) & **npm**
- **Python** (v3.12 or newer)
- **Git**

### 9.2 Backend Setup & Execution (`/backend`)
1. **Open a terminal** and navigate to the project root:
   ```bash
   cd /Users/sihanedward/Desktop/gem
   ```
2. **Create and activate a Python virtual environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. **Install backend Python dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. **Configure Backend Environment Variables (`backend/.env`)**:
   Create a `.env` file inside `backend/` with the following configuration:
   ```env
   # Local SQLite development database fallback:
   DATABASE_URL="sqlite:///./gem_marketplace.db"
   
   # For Supabase PostgreSQL production instance (if using cloud DB):
   # DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
   
   JWT_SECRET="your_secure_random_jwt_secret_key_2026"
   JWT_ALGORITHM="HS256"
   ```
5. **Initialize Database Tables & Seed Test Data**:
   Use our organized scripts inside `backend/scripts/` (`PYTHONPATH=.` from project root or `PYTHONPATH=..` inside `backend/`):
   ```bash
   # Recreate all database tables cleanly
   PYTHONPATH=. python backend/scripts/recreate_table.py
   
   # Seed mock seller (Anura Rathnayake, seller@example.com) and test gemstones
   PYTHONPATH=. python backend/scripts/seed_db.py
   ```
6. **Launch the FastAPI Server**:
   ```bash
   PYTHONPATH=. uvicorn backend.app.main:app --reload --port 8000
   ```
   - **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Alternative Documentation (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 9.3 Frontend Setup & Execution (`/frontend`)
1. **Open a second terminal window** and navigate to the frontend directory:
   ```bash
   cd /Users/sihanedward/Desktop/gem/frontend
   ```
2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```
3. **Configure Frontend Environment Variables (`frontend/.env.local`)**:
   Create a `.env.local` file inside `frontend/`:
   ```env
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret_key_change_me"
   NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
   ```
4. **Launch the Next.js 16 Development Server**:
   ```bash
   npm run dev
   ```
5. **Access the Application**:
   Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

### 9.4 Verification & Test Credentials
When running local seeded data, you can log in immediately or test APIs using:
- **Seller Account**: `email: seller@example.com` | `password: password123`
- **Buyer Account**: `email: buyer@example.com` | `password: password123` (or register any new account via `/register`).

### 9.5 Docker Compose Container Deployment
The application includes production-ready multi-stage Dockerfiles and root orchestration via `docker-compose.yml` that connects natively to your live **Supabase Managed PostgreSQL** and **Supabase Cloud Storage**:
1. **Multi-Stage Backend (`backend/Dockerfile`)**: Built on `python:3.12-slim-bookworm` with a dedicated non-root user (`appuser`). Uses `env_file: ./backend/.env` to securely inject live Supabase database pooling (`DATABASE_URL`), `SUPABASE_URL`, and `SUPABASE_KEY` without any local database clutter.
2. **Multi-Stage Standalone Frontend (`frontend/Dockerfile`)**: Built on `node:20-alpine` leveraging Next.js `output: "standalone"` inside `next.config.ts`, reducing final container size from ~1.2 GB to ~120 MB while running under non-root `nextjs` security user (`uid 1001`). Uses `env_file: ./frontend/.env.local` to inject NextAuth and Google OAuth credentials.
3. **Internal & External Bridge Networking (`gem_network`)**: Client browsers access the API via `NEXT_PUBLIC_API_URL=http://localhost:8000`, while Next.js server-side operations (NextAuth, SSR) communicate cleanly over Docker's internal DNS using `INTERNAL_API_URL=http://backend:8000`.

> [!WARNING]
> **CRITICAL: Port Conflict Troubleshooting (`bind: address already in use`)**  
> If you encounter an error like `listen tcp 0.0.0.0:3000: bind: address already in use` or `0.0.0.0:8000` when running `docker compose up`, your local development servers (`npm run dev` or `uvicorn`) are actively occupying ports `3000` or `8000` on your host machine.  
> **Resolution:** Stop any running `npm run dev` or `uvicorn` terminal processes (`CTRL+C` or `kill -9 $(lsof -t -i:3000)` / `kill -9 $(lsof -t -i:8000)`) before launching Docker Compose.

To start all services cleanly against your live Supabase cloud instance:
```bash
# 1. Ensure local host processes are stopped, then launch Docker containers in detached mode
docker compose up --build -d

# 2. Check running container health and status
docker compose ps
docker compose logs -f backend
```

---

## 10. Summary & Release Notes

- **Version 2.1.0 (July 2026 - Current Release)**:
  - **Global Notification Center & 15-Second Polling Engine**: Built persistent `Notification` models (`backend/app/models/notification.py`), schema (`NotificationResponse`), services, and REST endpoints (`GET /api/notifications`, `POST /api/notifications/{id}/read`, `POST /api/notifications/read-all`). Configured automated event alerts for purchase offers (`SELLING_OFFER`), order updates (`BUYING_STATUS`), chat messages (`NEW_MESSAGE`), and reviews (`REVIEW_RECEIVED`). Implemented 15-second background state polling (`UserStoreProvider.tsx`), interactive header Bell (`<Bell />`) popover, and `/notifications` full-page filter hub.
  - **Public User Profiles & Platform-Wide Cross-Linking**: Created `PublicUserResponse` DTO and public endpoint (`GET /api/users/{user_id}`). Built `/user/[id]` (and `/profile/user/[id]`) full user profile screen displaying hero reputation badges, overall rating pills, active listings (`GemCard` grid), and transaction reviews (`GET /api/reviews/user/{id}`). Connected seamless click links from `/gems/[id]` (`Visit Profile`), `/profile/selling` (`Potential Buyer`), and `/messages` (`View Partner Profile`).
  - **Segmented Sunlight vs. Studio Media Switcher**: Upgraded `GemMediaViewer.tsx` top view with a segmented pill toggle allowing buyers to switch cleanly between `Sunlight Photo` and `Studio Photo`, moving secondary angles, certificates, and videos to the bottom thumbnail gallery (`GemMediaList.tsx`).
  - **Port Conflict Safeguards**: Added comprehensive troubleshooting steps and guards between local development running and multi-container Docker Compose deployment.

- **Version 2.0.0 (July 2026)**:
  - **Docker Containerization & Orchestration**: Added multi-stage `backend/Dockerfile` (`python:3.12-slim`), `frontend/Dockerfile` (`node:20-alpine` with Next.js `output: "standalone"` optimization), `.dockerignore` files, and root `docker-compose.yml` with persistent volume (`sqlite_data`) and bridge networking (`gem_network`).
  - **Backend Layered Clean Architecture Refactor**: Transitioned from monolithic controllers to isolated Core (`app/core/`), Service (`app/services/`), and API (`app/api/v1/endpoints/`) layers. Added resilient bootstrap database check in `main.py` and moved utility scripts to `backend/scripts/`.
  - **Intelligent Gemstone Comparison Suite**: Added `CompareProvider.tsx` with dwell-time session analytics (`viewHistory`), `CompareSuggestionPopup.tsx` with `"Dismiss"` state persistence, `CompareTray.tsx` bottom dock, and `/compare` view featuring `Highlight Differences` and precision digital optical loupe (`Loupe Magnifier`).
