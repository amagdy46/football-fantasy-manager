# Frontend Architecture

## Modular Structure

The frontend follows a **feature-based modular architecture** where each module encapsulates its own components, hooks, pages, queries, mutations, and types.

## Directory Structure

```
frontend/src/
├── modules/
│   ├── common/          # Shared utilities across all modules
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Generic hooks (useLoadingDots, etc.)
│   │   ├── types/       # Shared type definitions
│   │   └── utils/       # Helper functions
│   │
│   ├── auth/            # Authentication & Authorization
│   │   ├── components/  # Auth-specific components
│   │   ├── context/     # AuthContext & AuthProvider
│   │   ├── hooks/       # Auth hooks
│   │   ├── pages/       # AuthPage
│   │   └── types/       # User, AuthContextType
│   │
│   ├── team/            # Team Management
│   │   ├── components/  # TeamHeader, PlayerCard, PlayerGrid, SoccerPitch
│   │   ├── hooks/       # useSquadSplit, useTransferActions, useTeamStatusPolling
│   │   ├── pages/       # DashboardPage, LoadingPage
│   │   ├── queries/     # useTeamQuery, useTeamStatusQuery
│   │   ├── mutations/   # useUpdateTeamNameMutation
│   │   └── types/       # Team, Player, Position
│   │
│   └── transfers/       # Transfer Market (Future)
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── queries/
│       └── mutations/
│
├── lib/                 # Core utilities
│   └── api.ts          # Axios client & API functions
│
└── test/                # Test utilities
    ├── setup.ts        # Vitest setup
    └── test-utils.tsx  # Custom render with providers
```

## Design Principles

### 1. **Feature-Based Modules**
Each module represents a distinct feature or domain:
- **auth**: User authentication and session management
- **team**: Team dashboard, squad management, team creation
- **transfers**: Transfer market (future)
- **common**: Shared utilities used across modules

### 2. **Queries vs Hooks**
- **Queries** (`/queries`): React Query hooks for data fetching
- **Mutations** (`/mutations`): React Query hooks for data mutations
- **Hooks** (`/hooks`): Business logic hooks (not React Query)

Example:
```typescript
// Query - Fetches data
export const useTeamQuery = () => {
  return useQuery({ queryKey: ["team"], queryFn: getTeam });
};

// Mutation - Updates data
export const useUpdateTeamNameMutation = () => {
  return useMutation({ mutationFn: updateTeamName });
};

// Hook - Business logic
export const useSquadSplit = (players) => {
  return useMemo(() => {
    const starters = players.filter(p => p.isStarter);
    const bench = players.filter(p => !p.isStarter);
    return { starters, bench };
  }, [players]);
};
```

### 3. **Module Exports**
Each module has a main `index.ts` that exports all public APIs:

```typescript
// modules/team/index.ts
export * from "./components";
export * from "./hooks";
export * from "./queries";
export * from "./mutations";
export * from "./types";
```

### 4. **Import Patterns**

**Good** ✅:
```typescript
// From another module
import { useTeamQuery, TeamHeader } from "@/modules/team";
import { useAuth } from "@/modules/auth";
import { useLoadingDots } from "@/modules/common";

// Within the same module
import { PlayerCard } from "../components";
import { useSquadSplit } from "../hooks";
import { Team, Player } from "../types";
```

**Bad** ❌:
```typescript
// Don't reach into other modules' internals
import { TeamHeader } from "@/modules/team/components/TeamHeader";

// Use module exports instead
import { TeamHeader } from "@/modules/team";
```

### 5. **Co-location of Tests**
Tests live next to their source files:
```
team/
├── hooks/
│   ├── useSquadSplit.ts
│   └── useSquadSplit.test.ts
├── components/
│   ├── PlayerCard.tsx
│   └── PlayerCard.test.tsx
```

## Path Aliases

Configured in `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts`:

```typescript
{
  "@/*": "./src/*",
  "@/modules/*": "./src/modules/*",
  "@/lib/*": "./src/lib/*",
  "@/test/*": "./src/test/*"
}
```

## Module Communication

### Shared State
- **Auth**: Use `AuthContext` from `@/modules/auth`
- **React Query**: Shared cache, invalidation via query keys

### Cross-Module Dependencies
- ✅ `team` → `auth` (OK: Team needs auth)
- ✅ `transfers` → `team` (OK: Transfers use team types)
- ❌ `auth` → `team` (NO: Auth shouldn't depend on team)

### Dependency Graph
```
       common
         ↑
         |
    ┌────┴────┐
    |         |
   auth     team
              ↑
              |
          transfers
```

## Adding a New Module

1. **Create folder structure**:
```bash
mkdir -p modules/new-feature/{components,hooks,pages,queries,mutations,types}
```

2. **Create index files**:
```typescript
// modules/new-feature/index.ts
export * from "./components";
export * from "./hooks";
export * from "./queries";
export * from "./mutations";
export * from "./types";
```

3. **Define types first**:
```typescript
// modules/new-feature/types/index.ts
export interface MyFeature {
  id: string;
  name: string;
}
```

4. **Create queries/mutations**:
```typescript
// modules/new-feature/queries/useMyFeatureQuery.ts
export const useMyFeatureQuery = () => {
  return useQuery({ queryKey: ["myFeature"], queryFn: fetchMyFeature });
};
```

5. **Build components**:
```typescript
// modules/new-feature/components/MyComponent.tsx
import { MyFeature } from "../types";
import { useMyFeatureQuery } from "../queries";
```

6. **Add to routing**:
```typescript
// App.tsx
import { MyFeaturePage } from "@/modules/new-feature";
```

## Benefits

✅ **Scalability**: Easy to add new features without affecting existing code
✅ **Maintainability**: Clear boundaries between features
✅ **Testability**: Co-located tests, easy to mock dependencies
✅ **Reusability**: Common module for shared utilities
✅ **Developer Experience**: Clear structure, easy to navigate
✅ **Code Splitting**: Can lazy-load entire modules

## Future Enhancements

1. **Lazy Loading**: Dynamic imports for modules
2. **Micro-frontends**: Each module could be a separate package
3. **Storybook**: Component documentation per module
4. **Module-level** E2E tests
5. **API Layer**: Per-module API clients with typed endpoints

