# @types Directory Structure

This directory contains all TypeScript type definitions organized by their original source location.

## Directory Structure

```
@types/
├── contexts/          # Types from src/contexts/
│   └── auth.ts       # AuthContext types (User, AuthContextType)
├── services/         # Types from src/services/
│   ├── aiAnalysis.ts        # AI analysis types (SymptomReport, AIAnalysisResult)
│   ├── patternAnalysis.ts   # Pattern analysis types (PatternAnalysisResult, ClusterData, etc.)
│   ├── geoapify.ts         # Geoapify service types (PhilippineRegion, PhilippineMunicipality, etc.)
│   └── outbreakAnnouncement.ts # Outbreak announcement types
├── hooks/            # Types from src/hooks/
│   └── toast.ts     # Toast hook types (ToasterToast, Action, State, etc.)
├── components/       # Types from src/components/
│   └── toast.ts     # Toast component types (ToastProps, ToastActionElement)
├── pages/           # Types from src/pages/
│   └── register.ts  # Registration page types (FormData, FormErrors)
├── data/            # Types from src/data/
│   └── regions.ts   # Region data types (RegionData)
└── index.ts         # Main export file for all types
```

## Usage

### Import from specific type files:
```typescript
import type { User, AuthContextType } from '@/@types/contexts/auth';
import type { PatternAnalysisResult } from '@/@types/services/patternAnalysis';
```

### Import from main index:
```typescript
import type { User, PatternAnalysisResult, FormData } from '@/@types';
```

### Backward compatibility:
All original files still re-export their types for backward compatibility:
```typescript
// This still works
import type { User } from '@/contexts/AuthContext';
import type { PatternAnalysisResult } from '@/services/patternAnalysisService';
```

## Benefits

1. **Centralized Types**: All types are organized in one location
2. **Clear Organization**: Types are grouped by their original source
3. **Better Maintainability**: Easy to find and update type definitions
4. **Backward Compatibility**: Existing imports continue to work
5. **Reduced Duplication**: Types are defined once and imported where needed

## Migration Notes

- All original type definitions have been moved to `@types/` folder
- Original files now import types from `@types/` and re-export them
- No breaking changes - all existing imports continue to work
- New code should prefer importing from `@types/` directly