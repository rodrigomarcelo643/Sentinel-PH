# Type Organization Improvements

## Overview
Fixed redundant type imports by centralizing all common domain types into a single source of truth.

## Changes Made

### 1. Created Core Types (`@types/core.ts`)
- Centralized all common domain types used across multiple components
- Includes: `Sentinel`, `SymptomReport`, `UserData`, `QRCodeData`, etc.
- Extended base types for specific use cases (e.g., `MapSymptomReport` extends `SymptomReport`)

### 2. Updated Main Types Index (`@types/index.ts`)
- Added export for core types
- Removed redundant page-specific type exports
- Maintained service and component type exports

### 3. Component Updates
- **BhwSentinels.tsx**: Removed local `Sentinel` interface, now imports from `@/@types`
- **BhwDashboard.tsx**: Added proper type imports for dashboard types
- **QRScanner.tsx**: Replaced local interfaces with centralized types

### 4. Removed Redundant Files
- Deleted `@types/pages/bhw/dashboard.ts`
- Deleted `@types/pages/bhw/sentinels.ts`
- Deleted `@types/pages/bhw/map.ts`
- Deleted `@types/pages/bhw/observations.ts`
- Deleted `@types/pages/bhw/qrScanner.ts`
- Removed empty `@types/pages/bhw/` directory

### 5. Service Types Cleanup
- Updated `@types/services/aiAnalysis.ts` to remove duplicate `SymptomReport`
- Maintained service-specific types like `AIAnalysisResult`

## Benefits

1. **No More Redundancy**: Single source of truth for common types
2. **Better Type Safety**: Consistent type definitions across components
3. **Easier Maintenance**: Changes to types only need to be made in one place
4. **Cleaner Imports**: Components import from centralized `@/@types` instead of scattered files
5. **Better Organization**: Clear separation between core domain types and service-specific types

## Usage

```typescript
// Import common types from centralized location
import { Sentinel, SymptomReport, UserData } from '@/@types';

// Service-specific types still available
import { AIAnalysisResult } from '@/@types';
```

## Type Categories

- **Core Domain Types**: `Sentinel`, `SymptomReport`, `UserData`, etc.
- **UI/Component Types**: Dashboard stats, data points for charts
- **Service Types**: AI analysis results, pattern analysis
- **Utility Types**: `Severity`, `UserLocation`