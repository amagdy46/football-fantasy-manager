# Backend Architecture

## Modular Structure

The backend follows a **feature-based modular architecture** where each module encapsulates its own controllers, services, jobs, routes, and types.

## Directory Structure

```
backend/src/
├── modules/
│   ├── common/          # Shared utilities across all modules
│   │   ├── middleware/  # Shared middleware (e.g., auth.ts)
│   │   ├── types/       # Shared type definitions
│   │   └── utils/       # Helper functions
│   │
│   ├── auth/            # Authentication & Authorization
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # Module-specific routes
│   │   ├── services/    # Business logic (optional)
│   │   └── types/       # Auth-specific types
│   │
│   ├── team/            # Team Management
│   │   ├── controllers/ # Team controllers
│   │   ├── jobs/        # Background jobs (teamCreationJob.ts)
│   │   ├── routes/      # Team routes
│   │   ├── services/    # Business logic (playerPoolService.ts)
│   │   └── types/       # Team types
│   │
│   └── transfers/       # Transfer Market (Future)
│       ├── controllers/
│       ├── routes/
│       └── services/
│
├── config/              # Configuration (database, redis)
├── prisma/              # Database schema and migrations
├── scripts/             # Utility scripts
└── index.ts             # Main entry point
```

## Design Principles

### 1. **Feature-Based Modules**
Each module represents a distinct feature or domain:
- **auth**: User authentication (register/login)
- **team**: Team dashboard, team creation logic, player pool management
- **transfers**: Transfer market transactions (future)
- **common**: Shared utilities used across modules

### 2. **Separation of Concerns**
- **Controllers**: Handle HTTP requests, validate input, call services, send responses.
- **Services**: Contain business logic, interact with database/external APIs.
- **Jobs**: Handle background tasks (BullMQ).
- **Routes**: Define API endpoints and map them to controllers.
- **Middleware**: Intercept requests for auth, logging, etc.

### 3. **Module Exports**
Each module has a main `index.ts` (optional) or structured exports to be used by the main application.
Currently, routes are aggregated in `src/routes/index.ts`.

### 4. **Import Patterns**

**Good** ✅:
```typescript
// From another module
import { teamCreationQueue } from "../../team/jobs/teamCreationJob";
import { authenticateToken } from "../../common/middleware/auth";

// Within the same module
import { PlayerPoolService } from "../services/playerPoolService";
import { Team } from "../types";
```

**Bad** ❌:
```typescript
// Avoid deep imports if a public API exists (future improvement)
import { internalHelper } from "../../team/services/internal";
```

### 5. **Co-location of Tests**
Tests live next to their source files:
```
team/
├── controllers/
│   ├── teamController.ts
│   └── teamController.test.ts
├── services/
│   ├── playerPoolService.ts
│   └── playerPoolService.test.ts
```

## Path Aliases

We use path aliases for cleaner imports, configured in `tsconfig.json` and `vitest.config.ts`.
- `@/*` -> `./src/*`

Examples:
```typescript
import prisma from "@/config/database";
import { authenticateToken } from "@/modules/common/middleware/auth";
```

## Module Communication

### Shared State
- **Database**: Prisma Client (`src/config/database.ts`)
- **Redis**: Shared connection (`src/config/redis.ts`)

### Cross-Module Dependencies
- ✅ `auth` → `team` (OK: Auth triggers team creation job)
- ✅ `transfers` → `team` (OK: Transfers modify team data)
- ❌ `team` → `transfers` (Avoid circular dependencies)

### Dependency Graph
```
       common
         ↑
         |
    ┌────┴────┐
    |         |
   auth ──→ team  (via Job Queue)
              ↑
              |
          transfers
```

## Adding a New Module

1. **Create folder structure**:
```bash
mkdir -p backend/src/modules/new-feature/{controllers,routes,services,types}
```

2. **Create Controller**:
```typescript
// modules/new-feature/controllers/featureController.ts
export const getFeature = async (req, res) => { ... }
```

3. **Create Routes**:
```typescript
// modules/new-feature/routes/feature.routes.ts
import { Router } from "express";
import { getFeature } from "../controllers/featureController";
const router = Router();
router.get("/", getFeature);
export default router;
```

4. **Register Routes**:
```typescript
// routes/index.ts
import featureRoutes from "../modules/new-feature/routes/feature.routes";
router.use("/feature", featureRoutes);
```

## Benefits

✅ **Scalability**: Easy to add new features without affecting existing code
✅ **Maintainability**: Clear boundaries between features
✅ **Testability**: Co-located tests, easy to mock dependencies
✅ **Reusability**: Common module for shared middleware
✅ **Developer Experience**: Clear structure, easy to navigate

