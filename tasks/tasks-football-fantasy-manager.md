## Architecture

The project follows a **modular, feature-based architecture** for both frontend and backend.

### Backend Structure (Modular)
```
backend/src/
├── modules/
│   ├── auth/            # Authentication module
│   │   ├── controllers/ # authController.ts
│   │   ├── routes/      # auth.routes.ts
│   │   ├── services/    # Business logic
│   │   └── types/       # Auth types
│   ├── team/            # Team management module
│   │   ├── controllers/ # teamController.ts
│   │   ├── routes/      # team.routes.ts
│   │   ├── services/    # playerPoolService.ts
│   │   ├── jobs/        # teamCreationJob.ts
│   │   └── types/       # Team types
│   ├── transfers/       # Transfer market module (future)
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   └── common/          # Shared utilities
│       ├── middleware/  # auth.ts (JWT middleware)
│       ├── types/       # Shared types
│       └── utils/       # Helper functions
├── config/              # database.ts, redis.ts
├── prisma/              # Database schema
├── scripts/             # Utility scripts
└── index.ts             # Main entry point
```

### Frontend Structure (Modular)
```
frontend/src/
├── modules/
│   ├── auth/            # Authentication module
│   │   ├── context/     # AuthContext.tsx
│   │   ├── pages/       # AuthPage.tsx
│   │   └── types/       # User types
│   ├── team/            # Team management module
│   │   ├── components/  # TeamHeader, PlayerCard, PlayerGrid, SoccerPitch
│   │   ├── hooks/       # useSquadSplit, useTransferActions, useTeamStatusPolling
│   │   ├── pages/       # DashboardPage, LoadingPage
│   │   ├── queries/     # useTeamQuery, useTeamStatusQuery (React Query)
│   │   ├── mutations/   # useUpdateTeamNameMutation (React Query)
│   │   └── types/       # Team, Player types
│   ├── transfers/       # Transfer market module (future)
│   │   ├── components/  # TransferFilters, TransferPlayerCard
│   │   ├── hooks/
│   │   ├── pages/       # TransferMarketPage
│   │   ├── queries/
│   │   └── mutations/
│   └── common/          # Shared utilities
│       ├── components/  # Reusable UI components
│       ├── hooks/       # useLoadingDots
│       └── types/       # Shared types
├── lib/                 # api.ts (Axios client)
├── test/                # Test utilities
└── App.tsx              # Root component
```

### Key Files

#### Backend
- `backend/src/modules/auth/` - Authentication logic
- `backend/src/modules/team/` - Team management, player pool, team creation jobs
- `backend/src/modules/common/middleware/auth.ts` - JWT authentication middleware
- `backend/src/routes/index.ts` - Routes aggregator
- `backend/src/data/seed-players.json` - Fallback player data

#### Frontend
- `frontend/src/modules/auth/` - Auth context, pages
- `frontend/src/modules/team/` - Team dashboard, components, queries/mutations
- `frontend/src/lib/api.ts` - API client
- `frontend/src/test/test-utils.tsx` - Testing utilities with providers
- `frontend/ARCHITECTURE.md` - Detailed architecture documentation
- `frontend/TESTING.md` - Testing setup and guidelines
- `frontend/REACT_QUERY.md` - React Query usage documentation

### Configuration
- `.env.example` - Environment variables template
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables
- `README.md` - Project documentation with setup instructions
- `Dockerfile` (Backend & Frontend) - Container definitions
- `docker-compose.yml` - Multi-container orchestration config

### Architecture Principles

- **Feature-Based Modules**: Each module (auth, team, transfers) contains all related code (controllers, routes, services, types)
- **Separation of Concerns**: 
  - `queries/` - React Query hooks for data fetching (frontend)
  - `mutations/` - React Query hooks for data mutations (frontend)
  - `hooks/` - Business logic hooks, not React Query (both)
  - `services/` - Business logic layer (backend)
  - `controllers/` - Request handlers (backend)
- **Shared Code**: Common module for middleware, utilities, and shared types
- **Co-located Tests**: Tests live next to their source files
- **Path Aliases**: Use `@/modules/*`, `@/lib/*` for clean imports

### Notes

- Unit tests are co-located with source files (e.g., `authController.ts` and `authController.test.ts`)
- **Backend Tests**: Use `npm test` in backend directory (Vitest)
- **Frontend Tests**: Use `npm test` in frontend directory (Vitest + React Testing Library)
- The backend uses Express.js with TypeScript and Prisma ORM
- PostgreSQL for database (supports transactions with row-level locking)
- Bull with Redis handles background job processing
- React Query for server state management on frontend

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/football-fantasy-manager`)

- [x] 1.0 Project Setup & Configuration (Backend + Frontend monorepo structure)
  - [x] 1.1 Create root folder structure with `backend/` and `frontend/` directories
  - [x] 1.2 Initialize backend with `npm init` and install Express, TypeScript, ts-node, nodemon
  - [x] 1.3 Configure TypeScript for backend (`tsconfig.json`)
  - [x] 1.4 Initialize frontend with Vite + React + TypeScript (`npm create vite@latest`)
  - [x] 1.5 Install and configure Tailwind CSS in frontend
  - [x] 1.6 Install and configure shadcn/ui in frontend
  - [x] 1.7 Install backend dependencies: cors, dotenv, bcrypt, jsonwebtoken, pg/mongoose, bull, ioredis
  - [x] 1.8 Install frontend dependencies: react-router-dom, axios, @tanstack/react-query, lucide-react
  - [x] 1.9 Create `.env.example` and `.env` files for both backend and frontend
  - [x] 1.10 Set up basic Express server with CORS and JSON middleware
  - [x] 1.11 Verify both servers run successfully (backend on port 3001, frontend on port 5173)
  - [x] 1.12 Create `backend/Dockerfile` for Node.js application
  - [x] 1.13 Create `frontend/Dockerfile` for Vite application (multi-stage build)
  - [x] 1.14 Create `docker-compose.yml` defining services: backend, frontend, postgres, redis
  - [x] 1.15 Configure environment variables for Docker context
  - [x] 1.16 Verify full stack startup with `docker-compose up`
  - [x] 1.17 Add unit & integration tests for setup and build (CI smoke tests)

- [x] 2.0 Database Schema & Models (User, Team, Player, PlayerPool)
  - [x] 2.1 Set up PostgreSQL database connection in `backend/src/config/database.ts`
  - [x] 2.2 Create User model with fields: id, email, password (hashed), createdAt, updatedAt
  - [x] 2.3 Create Team model with fields: id, userId, name, budget (default 5M), isReady, createdAt, updatedAt
  - [x] 2.4 Create Player model with fields: id, teamId, name, position, age, country, value, goals, assists, isOnTransferList, askingPrice, createdAt, updatedAt
  - [x] 2.5 Create PlayerPool model with fields: id, externalId, name, position, age, country, marketValue, goals, assists, createdAt
  - [x] 2.6 Create database migration/initialization script to create all tables
  - [x] 2.7 Test database connection and table creation
  - [x] 2.8 Add unit & integration tests for models and migrations

- [x] 3.0 Player Pool & Seed Data System (API integration + fallback JSON)
  - [x] 3.1 Create `backend/src/data/seed-players.json` with ~500 real players (fallback data)
  - [x] 3.2 Create `playerPoolService.ts` with function to fetch players from football-data.org API
  - [x] 3.3 Implement logic to parse API response and map to PlayerPool schema
  - [x] 3.4 Create function to seed PlayerPool from JSON fallback file
  - [x] 3.5 Implement initialization logic: try API first, fallback to JSON if unavailable
  - [x] 3.6 Create utility function `getRandomPlayersByPosition(position, count)` to draw from pool
  - [x] 3.7 Test player pool seeding and random selection
  - [x] 3.8 Add unit & integration tests for PlayerPoolService and seeding

- [x] 4.0 Authentication System (Single-flow login/register with JWT)
  - [x] 4.1 Create `POST /api/auth` route in `backend/src/routes/index.ts`
  - [x] 4.2 Implement `authController.ts` with single auth handler
  - [x] 4.3 Add email format validation and password validation (min 6 characters)
  - [x] 4.4 Implement password hashing with bcrypt (hash on register, compare on login)
  - [x] 4.5 Implement logic to check if user exists: create new user or verify password
  - [x] 4.6 Generate JWT token with no expiration on successful auth
  - [x] 4.7 Create auth middleware in `backend/src/middleware/auth.ts` to validate JWT
  - [x] 4.8 Create `AuthContext.tsx` in frontend for auth state management
  - [x] 4.9 Create `AuthPage.tsx` with single form (email + password inputs)
  - [x] 4.10 Style auth page with dark theme, centered card layout
  - [x] 4.11 Implement form validation on frontend (email format, password length)
  - [x] 4.12 Connect form submission to backend API using axios
  - [x] 4.13 Store JWT token in localStorage and update AuthContext
  - [x] 4.14 Implement protected route wrapper to redirect unauthenticated users
  - [x] 4.15 Add unit & integration tests for authentication flows

- [x] 5.0 Team Creation with Background Jobs (Async worker + polling)
  - [x] 5.1 Set up Redis connection in `backend/src/config/redis.ts`
  - [x] 5.2 Configure Bull queue for team creation jobs
  - [x] 5.3 Create `teamCreationJob.ts` with job processor function
  - [x] 5.4 Implement job logic: create Team record with isReady=false
  - [x] 5.5 Implement job logic: draw 20 random players (3 GK, 6 DEF, 6 MID, 5 ATT) from pool
  - [x] 5.6 Implement job logic: create Player records assigned to the team
  - [x] 5.7 Implement job logic: set team isReady=true when complete
  - [x] 5.8 Trigger team creation job in authController after new user registration
  - [x] 5.9 Create `GET /api/team/status` endpoint to check if team isReady
  - [x] 5.10 Create `LoadingPage.tsx` with animated spinner/football animation
  - [x] 5.11 Implement polling in LoadingPage to check team status every 2 seconds
  - [x] 5.12 Redirect to Dashboard when team isReady becomes true
  - [x] 5.13 Handle edge case: existing user login should skip loading if team is ready
  - [x] 5.14 Add unit & integration tests for team creation job and polling

- [x] 6.0 Team Dashboard UI (Player cards, budget display, team management)
  - [x] 6.1 Create `GET /api/team` endpoint to return team with all players
  - [x] 6.2 Create `PATCH /api/team` endpoint to update team name
  - [x] 6.3 Create `DashboardPage.tsx` layout with header and main content area
  - [x] 6.4 Create `TeamHeader.tsx` component showing team name (editable), budget, total team value
  - [x] 6.5 Implement inline team name editing with save functionality
  - [x] 6.6 Create `PlayerCard.tsx` component displaying: name, position badge, country flag, age, value, goals, assists
  - [x] 6.7 Add transfer list indicator on PlayerCard (badge/icon when listed)
  - [x] 6.8 Create `PlayerGrid.tsx` component with sections: Goalkeepers, Defenders, Midfielders, Attackers
  - [x] 6.9 Fetch team data on Dashboard mount using React Query
  - [x] 6.10 Style dashboard with dark slate background, green accents, card-based layout
  - [x] 6.11 Add "List for Transfer" button on each PlayerCard
  - [x] 6.12 Create modal/dialog for setting asking price when listing player
  - [x] 6.13 Implement "Remove from Transfer List" action for listed players
  - [x] 6.14 Add unit & integration tests for dashboard endpoints and UI components
  - [x] 6.15 Display starting XI in FPL-style football pitch visualization
  - [x] 6.16 Show bench and reserves separately
  - [x] 6.17 Add `isStarter` field to Player model
  - [x] 6.18 Implement logic to select best 11 players as starters

- [x] 6.5 Architecture Refactoring (Modular structure for scalability)
  - [x] 6.5.1 **Frontend Modular Architecture**
    - [x] Create `modules/` folder structure with auth, team, transfers, common
    - [x] Separate React Query queries into `queries/` folder
    - [x] Separate React Query mutations into `mutations/` folder
    - [x] Move business logic hooks to module-specific `hooks/` folders
    - [x] Move components to module-specific `components/` folders
    - [x] Move pages to module-specific `pages/` folders
    - [x] Create module index files for clean exports
    - [x] Update all imports to use new module structure
    - [x] Configure path aliases (@/modules, @/lib, @/test)
    - [x] Move tests to co-located positions within modules
    - [x] Run all tests to verify refactoring (32 tests passing)
    - [x] Create ARCHITECTURE.md documentation
    - [x] Update TESTING.md with new structure
    - [x] Create REACT_QUERY.md usage guide
  - [x] 6.5.2 **Backend Modular Architecture**
    - [x] Create `modules/` folder structure with auth, team, transfers, common
    - [x] Move auth controller to `modules/auth/controllers/`
    - [x] Move team controller to `modules/team/controllers/`
    - [x] Move playerPoolService to `modules/team/services/`
    - [x] Move teamCreationJob to `modules/team/jobs/`
    - [x] Move auth middleware to `modules/common/middleware/`
    - [x] Create module-specific route files
    - [x] Create module index files for clean exports
    - [x] Update all imports in backend modules
    - [x] Update controller tests with new imports
    - [x] Update service tests with new imports
    - [x] Update job tests with new imports
    - [x] Run all backend tests to verify refactoring
    - [x] Clean up old non-modular directories
    - [x] Create backend ARCHITECTURE.md documentation

- [x] 7.0 Transfer Market Backend (Listing, filtering, buying with transactions)
  - [x] 7.1 Create `PATCH /api/players/:id/transfer-list` endpoint
  - [x] 7.2 Implement add to transfer list: set isOnTransferList=true, askingPrice=provided value
  - [x] 7.3 Implement remove from transfer list: set isOnTransferList=false, askingPrice=null
  - [x] 7.4 Add validation: user can only modify their own players
  - [x] 7.5 Create `GET /api/transfers` endpoint to fetch all listed players
  - [x] 7.6 Implement query filters: teamName (partial), playerName (partial), minPrice, maxPrice
  - [x] 7.7 Exclude current user's own players from transfer market results
  - [x] 7.8 Create `POST /api/transfers/buy/:playerId` endpoint
  - [x] 7.9 Implement purchase validation: check player is on transfer list
  - [x] 7.10 Implement purchase validation: check buyer has sufficient budget (95% of asking price)
  - [x] 7.11 Implement purchase validation: check buyer won't exceed 25 players
  - [x] 7.12 Implement purchase validation: check seller won't go below 15 players
  - [x] 7.13 Implement purchase validation: prevent buying own players
  - [x] 7.14 Implement purchase with database transaction and row-level locking
  - [x] 7.15 Transfer logic: move player to buyer's team, update budgets, clear transfer status
  - [x] 7.16 Return appropriate error messages for all validation failures
  - [x] 7.17 Add unit & integration tests for transfer flows and transaction edge-cases

- [x] 8.0 Transfer Market UI (Filterable grid, buy/sell actions)
  - [x] 8.1 Create `TransferMarketPage.tsx` layout with filters sidebar and player grid
  - [x] 8.2 Create `TransferFilters.tsx` with inputs: team name, player name, min price, max price
  - [x] 8.3 Implement filter state management with URL query params or local state
  - [x] 8.4 Create `TransferPlayerCard.tsx` showing player details + asking price + "Buy" button
  - [x] 8.5 Display seller's team name on each transfer card
  - [x] 8.6 Fetch transfer market data with filters using React Query
  - [x] 8.7 Implement debounced filtering (300ms delay on input changes)
  - [x] 8.8 Create buy confirmation modal showing: player name, asking price, final price (95%), new budget
  - [x] 8.9 Implement buy action with loading state and error handling
  - [x] 8.10 Show success toast/notification on successful purchase
  - [x] 8.11 Handle "player already bought" error with friendly message
  - [x] 8.12 Handle "insufficient funds" error with friendly message
  - [x] 8.13 Handle "team full" (25 players) error with friendly message
  - [x] 8.14 Refetch transfer market data after successful purchase
  - [x] 8.15 Add unit & integration tests for transfer UI and buy flow

- [ ] 9.0 Documentation & Final Polish (README, setup instructions, time report)
  - [ ] 9.1 Create comprehensive README.md with project overview and features
  - [ ] 9.2 Document prerequisites (Node.js, PostgreSQL, Redis)
  - [ ] 9.3 Document installation steps for backend and frontend
  - [ ] 9.4 Document environment variables with descriptions
  - [ ] 9.5 Document how to run the application (development mode)
  - [ ] 9.6 Create time report section with breakdown by task/section
  - [ ] 9.7 Add screenshots or GIFs of the application (optional)
  - [ ] 9.8 Final code review: remove console.logs, unused imports, TODO comments
  - [x] 9.9 Test complete user flow: register → team created → view dashboard → list player → buy player
  - [ ] 9.10 Commit all changes and push to GitHub repository
