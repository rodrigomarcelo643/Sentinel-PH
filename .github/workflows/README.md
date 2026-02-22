# GitHub Actions Workflows

## Overview

Automated CI/CD pipelines for SentinelPH using GitHub Actions.

## Workflows

### 1. PR Validation (`pr-validation.yml`)

**Trigger**: Pull requests to `main` or `develop`

**Jobs**:
- ✅ Validate Frontend (npm build)
- ✅ Validate Backend (pnpm build)
- ✅ PR Summary

**Purpose**: Ensure code builds successfully before merging

### 2. CI/CD Pipeline (`ci-cd.yml`)

**Trigger**: Push to `main` branch or manual dispatch

**Jobs**:
- 🏗️ Build Frontend
- 🏗️ Build Backend
- 🚀 Deploy Frontend (Firebase Hosting)
- 🚀 Deploy Backend (Cloud Functions - configured but inactive)

**Purpose**: Automated deployment to production

### 3. Code Quality (`code-quality.yml`)

**Trigger**: Pull requests and pushes to `main`/`develop`

**Jobs**:
- 🔍 Lint Code (ESLint)
- 📝 TypeScript Check
- 🔒 Security Audit (npm/pnpm audit)

**Purpose**: Maintain code quality and security

## Setup Instructions

### Required Secrets

Add these secrets in GitHub repository settings:

#### Firebase (Frontend)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

#### Firebase Deployment
```
FIREBASE_SERVICE_ACCOUNT (JSON service account key)
FIREBASE_PROJECT_ID
FIREBASE_TOKEN (for Cloud Functions)
```

### Package.json Scripts

Ensure these scripts exist:

**Frontend** (`package.json`):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

**Backend** (`backend/package.json`):
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn server.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit"
  }
}
```

## Workflow Status

### Current Status

- ✅ PR Validation: Active
- ✅ Code Quality: Active
- ⚠️ CI/CD: Configured but deployment inactive

### Activation Steps

1. **Add GitHub Secrets**: Configure all required secrets
2. **Test Workflows**: Create test PR to validate
3. **Enable Deployment**: Uncomment deployment steps in `ci-cd.yml`
4. **Monitor**: Check Actions tab for workflow runs

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
choco install act-cli

# Test PR validation
act pull_request -W .github/workflows/pr-validation.yml

# Test CI/CD
act push -W .github/workflows/ci-cd.yml
```

## Troubleshooting

### Build Fails

**Frontend**:
- Check TypeScript errors: `npm run type-check`
- Check linting: `npm run lint`
- Verify dependencies: `npm ci`

**Backend**:
- Check TypeScript errors: `cd backend && npx tsc --noEmit`
- Verify dependencies: `cd backend && pnpm install`

### Deployment Fails

- Verify Firebase service account has correct permissions
- Check Firebase project ID matches
- Ensure all environment variables are set

### Cache Issues

Clear GitHub Actions cache:
1. Go to Actions tab
2. Click "Caches" in sidebar
3. Delete old caches

## Best Practices

1. **Always test locally** before pushing
2. **Keep secrets secure** - never commit them
3. **Monitor workflow runs** in Actions tab
4. **Update dependencies** regularly
5. **Review failed workflows** immediately

## Future Enhancements

- [ ] Add unit tests to workflows
- [ ] Add integration tests
- [ ] Add E2E tests with Cypress
- [ ] Add code coverage reports
- [ ] Add automatic changelog generation
- [ ] Add semantic versioning
- [ ] Add Slack/Discord notifications
- [ ] Add staging environment deployment
