# SentinelPH - Claude AI Integration

## Project Overview

SentinelPH is a community intelligence network for early health outbreak detection in the Philippines. It enables everyday Filipinos (sari-sari store owners, tricycle drivers, market vendors) to report health observations validated through AI-powered trust scoring and multi-source verification.

## Project Context

**Track**: 3 – Good Health and Well-Being  
**Purpose**: Early outbreak detection through community-sourced intelligence  
**Innovation**: Observation-based (not symptom-based) reporting with 3-Sentinel Rule validation

## Tech Stack

- **Frontend**: React 18.3 + TypeScript 5.6 + Vite 6.0 + Tailwind CSS
- **Backend**: Node.js + Express + Firebase Admin SDK
- **Database**: Firebase Firestore + Supabase (RAG)
- **AI/ML**: OpenAI GPT-3.5, Trust Score Engine, DBSCAN Clustering
- **APIs**: Google Maps, Twilio, Cloudinary, EmailJS

## Key Features

1. **AI-Powered Trust Scoring** (0-100 reliability score)
2. **3-Sentinel Rule** (multi-source validation)
3. **RAG-Enhanced Categorization** (Supabase vector DB)
4. **Real-time Observation Heatmaps**
5. **Two-Way Feedback Loop** (SMS/Email)
6. **Multi-Layered Spam Prevention**

## Project Structure

```
SentinelPh/
├── src/                    # Frontend (React + TypeScript)
├── backend/                # Backend services (Express + Firebase Admin)
├── rag/                    # RAG data storage
├── .agent/                 # AI agent documentation
└── .claude/                # Claude integration config
```

## Claude Integration Use Cases

### 1. Code Review & Optimization
- Review trust score algorithm
- Optimize observation processing
- Security audit

### 2. Documentation Generation
- API documentation
- Component documentation
- User guides

### 3. Test Generation
- Unit tests for services
- Integration tests for webhooks
- E2E test scenarios

### 4. Code Refactoring
- Improve code quality
- Reduce technical debt
- Enhance performance

### 5. Feature Development
- Implement new features
- Bug fixes
- Code improvements

## Important Files

### Core Logic
- `backend/config/firebase-admin.ts` - Firebase Admin SDK
- `backend/webhooks/observation-webhook.ts` - Observation processing
- `backend/services/email.ts` - Email notifications
- `src/services/openAiService/index.ts` - AI categorization

### AI/ML
- `backend/rag/prepare-rag.ts` - RAG data processing
- Trust score algorithm (to be implemented)
- DBSCAN clustering (to be implemented)

### Documentation
- `.agent/` - Comprehensive AI agent docs
- `rag/RAG_DOCUMENTATION.md` - RAG system guide
- `backend/README.md` - Backend setup

## Coding Standards

- **TypeScript**: Strict mode, proper typing
- **React**: Functional components, hooks
- **Backend**: Express middleware pattern
- **Error Handling**: Try-catch with proper logging
- **Validation**: Input sanitization, rate limiting
- **Security**: Firebase Auth, HMAC signatures

## Environment Variables

See `.env.example` for required configuration:
- Firebase (Frontend + Backend)
- Supabase (RAG)
- OpenAI (NLP)
- Twilio (SMS)
- Email (Nodemailer)
- n8n (Webhooks)

## Development Commands

```bash
# Frontend
npm run dev

# Backend
cd backend
pnpm run dev
pnpm run rag:prepare
```

## Key Concepts

### Trust Score (0-100)
- Verification history (40%)
- Consistency bonus (25%)
- Tenure bonus (20%)
- Peer validation (15%)

### 3-Sentinel Rule
- Requires 3+ independent sentinels
- 48-hour time window
- Aggregate trust score ≥150
- Geographic spread validation

### RAG System
- Supabase vector database
- OpenAI embeddings (1536-dim)
- Health textbooks as context
- Semantic search for categorization

## Future Enhancements

1. Multi-language support (Tagalog, Cebuano, Ilocano)
2. Offline-first PWA capabilities
3. Advanced analytics dashboard
4. Mobile app (React Native)
5. Integration with DOH systems
