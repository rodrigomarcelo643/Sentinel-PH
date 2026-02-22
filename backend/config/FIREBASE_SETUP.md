# Firebase Configuration Guide

## Two Separate Configs

### Frontend (Client SDK)
- Location: `src/lib/firebase.ts`
- Uses: Browser-safe API keys
- Purpose: User authentication, client-side operations

### Backend (Admin SDK)
- Location: `backend/config/firebase-admin.ts`
- Uses: Service account credentials
- Purpose: Full database access, server operations

## Setup Backend Firebase Admin

### 1. Get Service Account Key

1. Go to Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Download JSON file

### 2. Add to .env

```env
# Backend Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Important**: Keep private key in quotes and preserve `\n` line breaks

### 3. Alternative: Use JSON File

```typescript
// backend/config/firebase-admin.ts
import * as admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});
```

Add to `.gitignore`:
```
backend/config/serviceAccountKey.json
```

## Why Separate?

| Aspect | Frontend (Client SDK) | Backend (Admin SDK) |
|--------|----------------------|---------------------|
| **Access** | Limited by security rules | Full database access |
| **Auth** | User authentication | Service account |
| **Usage** | Browser, mobile apps | Server, webhooks |
| **Security** | API keys (public) | Private key (secret) |

## Security Best Practices

✅ **DO:**
- Use Admin SDK in backend only
- Keep private key in `.env` (never commit)
- Use security rules for frontend
- Separate frontend/backend configs

❌ **DON'T:**
- Use Admin SDK in frontend
- Commit service account keys
- Share private keys
- Use same config for both
