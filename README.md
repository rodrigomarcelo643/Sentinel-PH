<div align="center">
  <img src="public/sentinel_ph_logo.png" alt="SentinelPH Logo" width="300"/>
  <h1>SentinelPH: Community Intelligence Network for Early Outbreak Detection</h1>
</div>

<div align="center">

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white)
![n8n](https://img.shields.io/badge/n8n-EA4B71?logo=n8n&logoColor=white)

</div>

**Track:** 3 – Good Health and Well-Being

## 🎯 Problem Statement

The Philippines has no shortage of health data—it has a shortage of the right data at the right time. The current approach to outbreak detection is reactive, seeing outbreaks only after hospital admissions spike—when it's already too late for prevention. Communities themselves—the people who notice the first fever, the first child with diarrhea, the first neighbor who looks sick—have no structured way to share what they see.

**Current System Inefficiencies:**
- **Manual Reporting Delays** - Paper-based reports take weeks to process and reach health authorities
- **Health Center Bottlenecks** - Long waiting times during outbreak investigations while cases multiply
- **Repetitive Data Collection** - BHWs repeatedly ask the same questions during health visits, wasting valuable time
- **Information Silos** - Resident health histories scattered across different systems with no centralized access
- **Delayed Response** - Critical time lost between symptom onset and official health response

## 💡 Solution

SentinelPH builds a community intelligence network that trains everyday Filipinos—sari-sari store owners, tricycle drivers, market vendors, traditional hilots, and religious leaders—to become the first line of outbreak detection in their neighborhoods. Each resident receives a unique QR code that health workers, partner clinics, and authorized healthcare providers can scan to instantly access complete health profiles, self-reported symptoms, verified health trends, and real-time pattern analysis—transforming weeks of manual processing into seconds of digital intelligence with built-in safeguards that separate genuine signals from noise and misinformation.

**Digital QR Health Passport:** When residents visit potential healthcare partners (clinics, hospitals, pharmacies), their QR code provides instant access to all self-reported symptoms, verified health trends, and pattern analysis—eliminating repetitive questioning and enabling faster, more informed medical responses based on comprehensive health data rather than starting from scratch each visit.

## 👥 Target Users

**Primary Users (Community Sentinels):**
- Sari-Sari Store Owners & Market Vendors
- Tricycle Drivers & PUV Operators
- Barangay Tanods & Leaders
- Religious Leaders & Church Workers
- Traditional Healers & Hilots
- Barangay Health Workers

**Beneficiaries:**
- Entire Communities (faster detection = faster response)
- Vulnerable Populations (elderly, children, pregnant women, PWDs)
- Municipal & Provincial Health Officers
- Department of Health & Epidemiologists

## ✨ MVP Core Features

### 🏥 **BHW (Barangay Health Worker) Dashboard**
- **Sentinel Management** - Approve/reject community sentinel applications with document verification
- **Real-time Observations** - Live monitoring with 7-day trend analysis and symptom radar charts
- **QR Code Scanner** - Instant resident lookup with live health data, symptom history, and trend visualization
- **Interactive Mapping** - Real-time outbreak visualization with geographic clustering
- **Outbreak Pattern Recognition** - AI-powered detection of disease patterns and anomalies
- **Community Announcements** - Broadcast health advisories and alerts to residents

### 👥 **Community Sentinel Network**
- **Multi-Step Registration Process**
  - Step 1: Personal verification (name, email, contact, region/municipality/barangay)
  - Step 2: Document verification (valid ID upload + selfie verification)
  - Step 3: Credential finalization and approval waiting status
- **Mobile App Dashboard**
  - Home screen with health summary and status overview
  - History section for tracking reported symptoms
  - Plus icon for quick symptom reporting (self-report vs observed)
  - Profile with unique QR code for healthcare provider scanning
- **Real-Time Information Feed**
  - Live announcements and outbreak alerts
  - BHW directories with hotlines and emergency contacts
  - Push notifications for health advisories
- **Community Intelligence**
  - Interactive map showing nearby verified reports (latest only)
  - Anonymous community symptom visualization
  - Geographic clustering of health observations
- **Observation Reporting** - "What do you see?" approach vs. direct symptom reporting
- **Two-Way Communication** - Receive acknowledgments and health advisories
- **Future Integration** - Community forums for health discussions

### 🔍 **Real-Time Intelligence**
- **Live Data Sync** - Instant updates across all dashboards and mobile devices
- **3-Sentinel Rule** - Multi-source validation before outbreak alerts
- **AI Trust Scoring** - Validates sentinel reliability and filters spam
- **Spatial Clustering** - DBSCAN algorithm for geographic pattern detection
- **Predictive Analytics** - Early w  arning system for potential outbreaks

### 📱 **Mobile-First Design**
- **Progressive Web App (PWA)** - Works offline, low-bandwidth optimized
- **Audio Feedback** - Beep sounds and text-to-speech for accessibility
- **Real-time Notifications** - Instant alerts for new cases and announcements
- **Cross-Platform** - Seamless experience across desktop, tablet, and mobile

## 🎯 Key Innovations

- 📱 **Mobile-First PWA** - Works offline, low-bandwidth optimized
- 🔒 **AI-Powered Trust Scoring** - Validates sentinel reliability (0-100 score)
- ✅ **3-Sentinel Rule** - Multi-source validation before alerts
- 🗺️ **Observation Heatmaps** - Real-time geographic clustering
- 🔄 **Two-Way Feedback Loop** - Communities receive acknowledgments and advisories
- 🛡️ **Multi-Layered Spam Prevention** - Rate limiting, behavior monitoring, AI filtering
- 🎯 **Proximal Intelligence** - Catches outbreaks at pre-clinic stage
- 🏆 **Incentive System** - Load credits, recognition badges, community rankings
- 💳 **Subscription Management** - Track account and payment status separately
- 🎨 **Enhanced Toast Notifications** - Progress bar, auto-close, smooth animations

## 🏗️ Tech Stack

**Frontend:**
- React 18.3 + TypeScript 5.6
- Vite 6.0
- Tailwind CSS + Framer Motion
- Progressive Web App (PWA)
- Axios for HTTP requests

**Backend & Database:**
- Firebase (Auth, Firestore, Cloud Functions, Hosting)
- Real-time observation processing
- Multi-tenant architecture for LGUs

**AI/ML Components:**
- Trust Score Engine
- DBSCAN Spatial Clustering
- NLP for observation categorization (GPT API)
- Anomaly Detection & Spam Classification
- Predictive Correlation Models

**Integrations:**
- Google Maps API (observation heatmaps)
- Twilio API (SMS alerts & feedback)
- EmailJS (health officer notifications)
- Telecom partnerships (load credit incentives)

## 📁 Project Structure

```
SentinelPh/
├── src/                    # Frontend application
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components (toast, dialog, button, etc.)
│   │   ├── auth/         # Authentication components (LoginDialog)
│   │   └── sections/     # Page sections (HeroSection)
│   ├── pages/            # Application pages
│   │   ├── admin/        # Admin dashboard pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── BHWs.tsx           # BHW management with subscription status
│   │   │   ├── Municipalities.tsx
│   │   │   ├── Regions.tsx
│   │   │   ├── Sentinels.tsx
│   │   │   └── Map.tsx
│   │   ├── bhw/          # BHW dashboard pages
│   │   │   ├── BhwDashboard.tsx
│   │   │   └── BhwSentinels.tsx
│   │   └── public/       # Public pages
│   │       ├── LandingPage.tsx
│   │       ├── RegisterPage.tsx   # Registration with subscription status
│   │       └── PricingPage.tsx
│   ├── layouts/          # Layout components
│   │   ├── admin/        # Admin layout
│   │   ├── bhw/          # BHW layout
│   │   └── municipal/    # Municipal layout
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx        # Authentication with Firestore role fetching
│   ├── services/         # Service integrations
│   │   ├── openAiService/         # AI categorization (Axios-based)
│   │   ├── googleMapService/      # Maps integration
│   │   └── cloudinaryService/     # Image upload (Axios-based)
│   ├── hooks/            # Custom React hooks
│   │   ├── use-toast.ts           # Toast notification hook
│   │   └── use-mobile.ts
│   ├── router/           # React Router configuration
│   │   └── index.tsx              # Routes with role-based protection
│   ├── lib/              # Utility functions
│   │   ├── utils.ts      # Helper functions (cn utility)
│   │   └── firebase.ts   # Firebase client config
│   ├── data/             # Static data
│   │   └── regions.ts    # Philippine regions data
│   └── assets/           # Static assets (images, fonts, sounds)
│
├── backend/               # Backend services
│   ├── webhooks/         # Webhook handlers
│   │   ├── observation-webhook.ts  # Observation processing
│   │   ├── sms-webhook.ts         # SMS notifications
│   │   └── auth-webhook.ts        # Authentication & registration
│   ├── services/         # Backend services
│   │   └── email.ts      # Email notifications (OTP, approval, etc.)
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── rateLimit.ts  # Rate limiting
│   │   ├── validation.ts # Input validation
│   │   └── errorHandler.ts # Error handling
│   ├── config/           # Configuration
│   │   └── firebase-admin.ts # Firebase Admin SDK
│   ├── rag/              # RAG processing
│   │   ├── prepare-rag.ts      # Process textbooks from Supabase
│   │   ├── query-rag.ts        # Interactive query tool
│   │   └── supabase-schema.sql # Database schema
│   ├── server.ts         # Main webhook server
│   └── package.json      # Backend dependencies (pnpm)
│
├── rag/                   # RAG data storage
│   ├── health-guidelines/     # DOH/WHO guidelines
│   ├── disease-patterns/      # Historical outbreak data
│   ├── symptoms-database/     # Verified symptoms
│   ├── medication-reference/  # Common medications
│   ├── training-materials/    # Sentinel training
│   ├── advisories/           # Health advisories
│   └── RAG_DOCUMENTATION.md  # RAG system guide
│
├── .agent/               # AI agent documentation
│   ├── architecture/     # System architecture docs
│   ├── features/         # Feature specifications
│   ├── ai-ml/           # AI/ML documentation
│   └── api/             # API integration docs
│
├── .claude/             # Claude AI integration
│   ├── project-context.md  # Project overview
│   ├── prompts.md         # Prompt library
│   ├── commit-style.txt   # Git commit style guide
│   └── config.json        # Project configuration
│
├── .github/             # GitHub Actions
│   └── workflows/       # CI/CD workflows (disabled)
│       ├── pr-validation.yml  # PR validation
│       ├── ci-cd.yml         # Deployment pipeline
│       └── code-quality.yml  # Code quality checks
│
├── public/              # Public assets
├── firestore.rules      # Firestore security rules
├── storage.rules        # Firebase storage rules
├── firebase.json        # Firebase configuration
├── .env.example         # Environment variables template
└── package.json         # Frontend dependencies (pnpm)
```

## 🚀 Getting Started

### Frontend
```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build
```

### Backend
```bash
# Install dependencies
cd backend
pnpm install

# Run webhook server
pnpm run dev

# Prepare RAG data
pnpm run rag:prepare
```

## 🔑 Core Innovation

Instead of asking communities to report symptoms (which feels like surveillance), SentinelPH asks them to report **what they observe** (which feels like community participation):
- More people buying paracetamol than usual?
- Several children absent from community gatherings?
- Neighbors mentioning the same illness?
- Families boiling water after floods?

## 🎯 What Makes This Different

- **Taps Informal Observers** - First system designed for sari-sari stores, tricycle drivers, market vendors
- **Observation-Based** - "What do you see?" not "Who is sick?" (reduces privacy concerns)
- **Incentivized Participation** - Real rewards tied to verified accuracy
- **Multi-Layered Spam Prevention** - Progressive onboarding, rate limiting, AI filtering
- **3-Sentinel Rule** - Multiple unrelated sources required before alerts
- **Two-Way Communication** - Closes the loop with communities
- **Proximal Intelligence** - Catches outbreaks at pre-clinic stage
- **Community Empowerment** - Active participants, not passive data sources

## 💰 Revenue Model

**LGU & Health System Subscriptions (85%):**
- Barangay Plan: ₱300/month (up to 20 sentinels)
- Municipal Plan: ₱1,500/month (unlimited sentinels, advanced analytics)
- Provincial Plan: ₱4,000/month (regional pattern detection, API access)

**Partnerships & Services (15%):**
- Telecom partnerships (load credit revenue share)
- NGO health program integration
- Corporate CSR sponsorship
- Training & certification services
- Anonymized data research licenses


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built for Innovation Cup Hackathon** | Empowering Communities, Protecting Health
