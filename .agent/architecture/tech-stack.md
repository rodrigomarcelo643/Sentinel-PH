# Tech Stack

## Frontend

### Core Framework
- **React 18.3** - UI library
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool and dev server

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **class-variance-authority** - Component variant management
- **clsx + tailwind-merge** - Conditional className utility

### PWA Features
- Service Workers for offline functionality
- IndexedDB for local data storage
- Background sync for observation queue

## Backend & Database

### Firebase Services
- **Firebase Auth** - Phone number authentication with OTP
- **Firestore** - Real-time NoSQL database
- **Cloud Functions** - Serverless backend (Node.js)
- **Firebase Storage** - Image and file storage
- **Firebase Hosting** - Static site deployment

### Database Schema
See [database-schema.md](./database-schema.md) for detailed collection structures.

## AI/ML Components

### Machine Learning
- **Trust Score Engine** - Custom algorithm (TypeScript)
- **DBSCAN Clustering** - Spatial observation clustering
- **Anomaly Detection** - Behavioral pattern monitoring

### Natural Language Processing
- **OpenAI GPT-3.5-turbo** - Observation categorization and spam detection
- Temperature: 0.1-0.3 for consistency

## External APIs

### Mapping & Geolocation
- **Google Maps JavaScript API**
  - Maps visualization
  - Heatmap layer
  - Geocoding service
  - Places API

### Communication
- **Twilio API** - SMS alerts and feedback
- **EmailJS** - Email notifications to health officers
- **Push Notifications** - Web Push API

### Media Management
- **Cloudinary** - Image upload, optimization, and CDN

## Development Tools

- **Git/GitHub** - Version control
- **VS Code** - IDE
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Firebase Emulator Suite** - Local testing

## Environment Variables

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=

# OpenAI
VITE_OPENAI_API_KEY=

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

## Package Dependencies

### Core
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "typescript": "^5.6.0",
  "vite": "^6.0.0"
}
```

### Firebase
```json
{
  "firebase": "^10.x.x"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.4.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

### Utilities
```json
{
  "@googlemaps/js-api-loader": "^1.16.0"
}
```
