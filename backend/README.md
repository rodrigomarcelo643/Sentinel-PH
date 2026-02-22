# SentinelPH Backend

Backend services for SentinelPH including webhooks and RAG processing.

## Structure

```
backend/
├── webhooks/
│   ├── observation-webhook.ts    # Observation processing
│   ├── sms-webhook.ts            # SMS notifications
│   └── ...
├── rag/
│   ├── prepare-rag.ts            # RAG data preparation
│   └── query-rag.ts              # RAG query tool
├── server.ts                     # Main webhook server
└── package.json                  # Backend dependencies
```

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` in project root with:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# n8n
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_SECRET=your_secret

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Server
WEBHOOK_PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Run Backend

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

## RAG Operations

### Prepare RAG Data

```bash
npm run rag:prepare
```

### Query RAG

```bash
npm run rag:query
```

## Webhooks

All webhooks available at `http://localhost:3001/webhook/*`

- `/webhook/observation` - Process observations
- `/webhook/alert` - Send alerts
- `/webhook/trust-score` - Update trust scores
- `/webhook/send-sms` - Send SMS
- `/webhook/send-feedback` - Send feedback
- `/webhook/send-bulk-sms` - Bulk SMS

## Services Integration

Backend uses services from `src/services/`:
- `openAiService` - AI categorization
- `googleMapService` - Maps integration
- `cloudinaryService` - Image handling

Firebase config from `src/lib/firebase.ts`
