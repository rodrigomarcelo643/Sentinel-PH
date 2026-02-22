<div align="center">
  <img src="public/sentinel_ph_logo.jpg" alt="SentinelPH Logo" width="300"/>
  <h1>SentinelPH: Community Intelligence Network for Early Outbreak Detection</h1>
</div>

<div align="center">

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)

</div>

**Track:** 3 – Good Health and Well-Being

## 🎯 Problem Statement

The Philippines has no shortage of health data—it has a shortage of the right data at the right time. The current approach to outbreak detection is reactive, seeing outbreaks only after hospital admissions spike—when it's already too late for prevention. Communities themselves—the people who notice the first fever, the first child with diarrhea, the first neighbor who looks sick—have no structured way to share what they see.

## 💡 Solution

SentinelPH builds a community intelligence network that trains and equips everyday Filipinos—including sari-sari store owners, tricycle drivers, market vendors, traditional hilots, and religious leaders—to become the first line of outbreak detection in their own neighborhoods with built-in safeguards that separate genuine signals from noise and misinformation.

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

## ✨ Key Features

- 📱 **Mobile-First PWA** - Works offline, low-bandwidth optimized
- 🔒 **AI-Powered Trust Scoring** - Validates sentinel reliability (0-100 score)
- ✅ **3-Sentinel Rule** - Multi-source validation before alerts
- 🗺️ **Observation Heatmaps** - Real-time geographic clustering
- 🔄 **Two-Way Feedback Loop** - Communities receive acknowledgments and advisories
- 🛡️ **Multi-Layered Spam Prevention** - Rate limiting, behavior monitoring, AI filtering
- 🎯 **Proximal Intelligence** - Catches outbreaks at pre-clinic stage
- 🏆 **Incentive System** - Load credits, recognition badges, community rankings

## 🏗️ Tech Stack

**Frontend:**
- React 18.3 + TypeScript 5.6
- Vite 6.0
- Tailwind CSS
- Progressive Web App (PWA)

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
│   │   ├── ui/           # Base UI components (buttons, cards, etc.)
│   │   ├── sentinel/     # Sentinel-specific components
│   │   ├── bhw/          # BHW dashboard components
│   │   └── maps/         # Map visualization components
│   ├── services/         # Shared services (frontend & backend)
│   │   ├── openAiService/      # AI categorization & spam detection
│   │   ├── googleMapService/   # Maps integration
│   │   └── cloudinaryService/  # Image upload
│   ├── lib/              # Utility functions
│   │   ├── utils.ts      # Helper functions (cn utility)
│   │   └── firebase.ts   # Firebase client config
│   ├── assets/           # Static assets
│   └── App.tsx           # Main application
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
