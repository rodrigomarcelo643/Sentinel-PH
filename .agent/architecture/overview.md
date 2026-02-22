# System Architecture Overview

## Project Structure

```
SentinelPh/
├── src/
│   ├── components/
│   │   ├── ui/           # Base UI components (buttons, cards, etc.)
│   │   ├── sentinel/     # Sentinel-specific components
│   │   ├── bhw/          # BHW dashboard components
│   │   └── maps/         # Map visualization components
│   ├── lib/
│   │   ├── utils.ts      # Helper functions (cn utility)
│   │   ├── firebase.ts   # Firebase configuration
│   │   └── trust-score.ts # Trust scoring algorithm
│   ├── services/
│   │   ├── googleMapService/  # Google Maps integration
│   │   ├── openAiService/     # OpenAI GPT for NLP & spam detection
│   │   └── cloudinaryService/ # Image upload/management
│   └── App.tsx
├── .agent/               # AI agent documentation
├── firestore.rules       # Firestore security rules
├── storage.rules         # Storage security rules
├── firebase.json         # Firebase configuration
└── .env.example          # Environment variables template
```

## Architecture Layers

### 1. Frontend Layer (React + TypeScript)
- Progressive Web App (PWA)
- Offline-first architecture
- Mobile-responsive UI with Tailwind CSS
- Component-based design system

### 2. Backend Layer (Firebase)
- **Authentication**: Phone number OTP verification
- **Firestore**: Real-time NoSQL database
- **Cloud Functions**: Serverless backend logic
- **Storage**: Image and file storage
- **Hosting**: Static site hosting

### 3. AI/ML Layer
- Trust Score Engine (custom algorithm)
- OpenAI GPT-3.5 (NLP categorization & spam detection)
- DBSCAN Spatial Clustering
- Anomaly Detection
- Multi-Source Validation Logic

### 4. Integration Layer
- Google Maps API (heatmaps, geocoding)
- Twilio API (SMS notifications)
- Cloudinary (image management)
- EmailJS (email notifications)

## Data Flow

1. **Sentinel submits observation** → Frontend validation → Rate limiting check
2. **Observation stored** → Firestore with pending status
3. **AI processing** → OpenAI categorization + spam detection
4. **Trust score applied** → Sentinel's current trust score attached
5. **BHW verification** → Manual review and status update
6. **Multi-source validation** → Check for 3+ sentinels reporting similar patterns
7. **Alert generation** → If 3-Sentinel Rule met, create alert
8. **Feedback loop** → Notify sentinels via SMS/push notification

## Security Architecture

- Phone number verification (one account per number)
- Device fingerprinting
- Geolocation proximity check (2km radius)
- Progressive onboarding with trial period
- Rate limiting (5 observations/day, 15-min cooldown)
- BHW approval for new sentinels
- Progressive penalties for false reports
