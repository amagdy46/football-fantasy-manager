# Product Requirements Document: Football Fantasy Manager

## 1. Introduction/Overview

Football Fantasy Manager is a web application that allows users to manage their own football teams and participate in a transfer market to buy and sell players. Users can register with an email and password, receive an auto-generated team of 20 real football players, and engage in player transfers with other users.

**Problem Statement:** Football fans want an engaging way to manage virtual teams using real player data, make strategic transfer decisions, and compete with other managers in a transfer market economy.

**Goal:** Create a functional football fantasy manager web application with user authentication, team management, and a transfer market system.

---

## 2. Goals

1. **User Engagement:** Provide an intuitive platform for users to manage their football teams
2. **Seamless Onboarding:** Single-flow authentication that handles both registration and login
3. **Real Player Data:** Integrate real football player data for authentic experience
4. **Transfer Market Economy:** Enable users to buy/sell players with other managers
5. **Responsive Design:** Modern, visually appealing UI that works across devices

---

## 3. User Stories

### Authentication
- **US-1:** As a new user, I want to register with my email and password so that I can start managing my team
- **US-2:** As an existing user, I want to log in with my email and password so that I can access my team
- **US-3:** As a user, I want a single form that handles both registration and login so that I don't have to navigate between different pages

### Team Management
- **US-4:** As a new user, I want to receive a team with 20 players automatically so that I can start playing immediately
- **US-5:** As a user, I want to see my team's budget so that I know how much I can spend on transfers
- **US-6:** As a user, I want to view all my players with their details (name, position, age, country, stats) so that I can make informed decisions
- **US-7:** As a user, I want to customize my team name so that it feels personalized
- **US-8:** As a user, I want to see a loading screen while my team is being created so that I know the system is working

### Transfer Market
- **US-9:** As a user, I want to add my players to the transfer list with a custom asking price so that other users can buy them
- **US-10:** As a user, I want to remove my players from the transfer list so that I can change my mind
- **US-11:** As a user, I want to browse players on the transfer market so that I can find players to buy
- **US-12:** As a user, I want to filter transfers by team name, player name, and price so that I can find specific players
- **US-13:** As a user, I want to buy players from other teams at 95% of their asking price so that I get a discount
- **US-14:** As a user, I want to be prevented from having fewer than 15 or more than 25 players so that team sizes remain balanced

---

## 4. Functional Requirements

### 4.1 Authentication

| ID | Requirement |
|----|-------------|
| FR-1 | The system must provide a single authentication form that handles both registration and login |
| FR-2 | The system must accept email and password for authentication |
| FR-3 | The system must validate email format and password strength (minimum 6 characters) |
| FR-4 | The system must create a new user account if the email doesn't exist (registration) |
| FR-5 | The system must authenticate existing users if the email exists (login) |
| FR-6 | The system must provide appropriate error messages for invalid credentials |
| FR-7 | The system must maintain user sessions using JWT tokens (no expiration) |

### 4.2 Team Creation

| ID | Requirement |
|----|-------------|
| FR-8 | The system must automatically create a team when a new user registers |
| FR-9 | The system must assign a starting budget of $5,000,000 to each new team |
| FR-10 | The system must generate a team with exactly 20 players: 3 GK, 6 DEF, 6 MID, 5 ATT |
| FR-11 | The system must fetch real player data from a football API (football-data.org or similar) |
| FR-12 | The system must assign random market values to players within reasonable ranges |
| FR-13 | The system must handle team creation asynchronously (background process) |
| FR-14 | The system must show a loading screen while team creation is in progress |
| FR-15 | The system must allow users to set a custom team name |
| FR-16 | Each player must have: Name, Position, Value, Age, Country, and Stats (goals, assists) |

### 4.3 Team Dashboard

| ID | Requirement |
|----|-------------|
| FR-17 | The system must display the user's team name and total budget |
| FR-18 | The system must display all players in the user's team with full details |
| FR-19 | The system must organize players by position (GK, DEF, MID, ATT) |
| FR-20 | The system must show which players are currently on the transfer list |
| FR-21 | The system must display the total team value |
| FR-22 | The system must designate 11 players as "starters" (best by market value) |
| FR-23 | The system must display the starting XI in an FPL-style football pitch visualization |
| FR-24 | The system must display bench and reserve players separately |
| FR-25 | The system must show player stats (goals/assists) on hover in the pitch view |

### 4.4 Transfer Market

| ID | Requirement |
|----|-------------|
| FR-26 | The system must display all players currently listed on the transfer market |
| FR-27 | The system must allow filtering by team name (partial match) |
| FR-28 | The system must allow filtering by player name (partial match) |
| FR-29 | The system must allow filtering by price range (min/max) |
| FR-30 | The system must allow users to add their players to the transfer list |
| FR-31 | The system must require an asking price when listing a player |
| FR-32 | The system must allow users to remove their players from the transfer list |
| FR-33 | The system must allow users to buy listed players at 95% of asking price |
| FR-34 | The system must update both teams' budgets after a transfer |
| FR-35 | The system must prevent a team from having fewer than 15 players |
| FR-36 | The system must prevent a team from having more than 25 players |
| FR-37 | The system must prevent users from buying their own listed players |
| FR-38 | The system must prevent purchases if the buyer has insufficient budget |
| FR-39 | The system must handle concurrent purchase attempts using database transactions (first-come-first-served) |
| FR-40 | The system must show a friendly error if a player was just purchased by another user |

---

## 5. Non-Goals (Out of Scope)

- **No email verification:** Registration does not require email confirmation
- **No password reset:** Forgot password functionality is not included
- **No real-time updates:** Transfer market does not update in real-time (refresh required)
- **No match simulation:** No actual football matches or scoring system
- **No leagues or competitions:** No league tables or head-to-head competitions
- **No player training/development:** Player stats remain static
- **No multiple teams per user:** Each user has exactly one team
- **No social features:** No chat, messaging, or friend systems
- **No mobile app:** Web application only (responsive design)
- **No payment integration:** All transactions use in-game currency only

---

## 6. Design Considerations

### 6.1 Visual Style
- **Theme:** Dark mode with sports-inspired aesthetics
- **Primary Colors:** Dark slate/zinc backgrounds (#0f172a, #1e293b)
- **Accent Colors:** Green tones (#22c55e, #16a34a) for football pitch theme
- **Secondary Accents:** Gold/amber for highlights and CTAs

### 6.2 UI Framework
- **Frontend:** React with TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui library
- **Icons:** Lucide React icons

### 6.3 Key Screens
1. **Auth Screen:** Single form with email/password, dynamic button text (Login/Register)
2. **Loading Screen:** Animated football/spinner while team is being created (with retry button if timeout)
3. **Dashboard:** Team overview with FPL-style pitch visualization for starting XI + bench grid
4. **Transfer Market:** Filterable table/grid of available players
5. **Player Card:** Reusable component showing player details and stats
6. **Soccer Pitch:** Visual representation of starting XI on a football pitch with position-based layout

### 6.4 Design References
- FPL (Fantasy Premier League) dashboard layout
- Modern sports apps with dark themes
- Card-based player displays with stats visualization

---

## 7. Technical Considerations

### 7.1 Architecture Pattern: Modular Feature-Based Structure

Both frontend and backend follow a **modular, feature-based architecture** for scalability and maintainability.

#### Modules:
- **auth**: Authentication and user management
- **team**: Team management, player pool, team creation
- **transfers**: Transfer market (future)
- **common**: Shared middleware, utilities, types

#### Key Principles:
- **Separation of Concerns**: Controllers, services, routes, queries, mutations are organized by feature
- **Co-located Tests**: Tests live next to their source files
- **Clean Exports**: Each module has an index file for organized imports
- **Path Aliases**: Use `@/modules/*`, `@/lib/*` for readable imports

### 7.2 Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Prisma (type-safe database access)
- **Database:** PostgreSQL (row-level locking for transfers)
- **Authentication:** JWT tokens (no expiration)
- **Background Jobs:** Bull queue with Redis for async team creation
- **API:** RESTful endpoints
- **Testing:** Vitest for unit and integration tests
- **Structure:**
  ```
  backend/src/modules/
  ├── auth/       # Authentication module
  ├── team/       # Team management, jobs, services
  ├── transfers/  # Transfer market (future)
  └── common/     # Shared middleware (JWT auth)
  ```

### 7.3 Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Server State:** React Query (queries and mutations)
- **Client State:** React Context (AuthContext)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with shadcn/ui
- **Testing:** Vitest + React Testing Library
- **Structure:**
  ```
  frontend/src/modules/
  ├── auth/       # Auth context, pages
  ├── team/       # Team components, queries, mutations, hooks
  ├── transfers/  # Transfer market (future)
  └── common/     # Reusable utilities and components
  ```
- **Query/Mutation Pattern:**
  - `/queries/` - React Query hooks for data fetching
  - `/mutations/` - React Query hooks for data updates
  - `/hooks/` - Business logic hooks (non-React Query)

### 7.4 External APIs & Data Strategy
- **Player Data Source:** football-data.org API (free tier available)
- **Caching Strategy:** Pre-fetch player data and store in database as "player pool"
- **Fallback:** JSON seed file with ~500 real players for when API is unavailable
- **Team Creation:** Draws random players from cached pool (no live API calls)

### 7.5 Infrastructure & Deployment
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Run all services (Frontend, Backend, Postgres, Redis) via single `docker-compose up` command
- **Development:** Hot-reload enabled for both frontend and backend


---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| User can register and receive a team | 100% success rate |
| Team creation completes within | < 30 seconds |
| Transfer market filters work correctly | 100% accuracy |
| Transfer transactions complete successfully | 100% data integrity |
| Page load time | < 3 seconds |
| Mobile responsiveness | Works on all screen sizes |

---

## 9. Data Models

### User
```
- id: UUID
- email: string (unique)
- password: string (hashed)
- createdAt: timestamp
- updatedAt: timestamp
```

### Team
```
- id: UUID
- userId: UUID (foreign key)
- name: string
- budget: decimal (default: 5,000,000)
- isReady: boolean (default: false)
- createdAt: timestamp
- updatedAt: timestamp
```

### Player
```
- id: UUID
- teamId: UUID (foreign key)
- name: string
- position: enum (GK, DEF, MID, ATT)
- age: integer
- country: string
- value: decimal (real market value from API)
- goals: integer
- assists: integer
- isOnTransferList: boolean (default: false)
- askingPrice: decimal (nullable)
- isStarter: boolean (default: false) - designates starting XI
- createdAt: timestamp
- updatedAt: timestamp
```

### PlayerPool (Cached API Data)
```
- id: UUID
- externalId: string (API player ID)
- name: string
- position: enum (GK, DEF, MID, ATT)
- age: integer
- country: string
- marketValue: decimal (from API)
- goals: integer
- assists: integer
- createdAt: timestamp
```
*Note: Players are copied from PlayerPool to Player table when assigned to a team*

---

## 10. API Endpoints (Suggested)

### Authentication
- `POST /api/auth` - Register or login user

### Team
- `GET /api/team` - Get current user's team with players
- `PATCH /api/team` - Update team name
- `GET /api/team/status` - Check if team creation is complete

### Players
- `PATCH /api/players/:id/transfer-list` - Add/remove player from transfer list

### Transfer Market
- `GET /api/transfers` - Get all players on transfer market (with filters)
- `POST /api/transfers/buy/:playerId` - Buy a player from transfer market

---

## 11. Resolved Questions

1. **Player Value Algorithm:** Use real market values from the football API. Store actual player valuations from the data source.

2. **Transfer List Duration:** No expiration. Players remain on the transfer list until manually removed by the owner or purchased by another user.

3. **Concurrent Transfers:** Use database transactions with row-level locking (SELECT FOR UPDATE). First transaction to complete wins; subsequent attempts receive a friendly error message: "Sorry, this player was just bought by another manager."

4. **API Rate Limits:** Implement a two-tier strategy:
   - **Primary:** Pre-fetch player data from the API and cache in database as a "player pool"
   - **Fallback:** Include seed data (JSON file with ~500 real players) for when API is unavailable
   - Team creation draws from the cached pool, not live API calls

5. **Session Duration:** Sessions remain valid indefinitely (no expiration). Users stay logged in until they explicitly log out.

---

## 12. Timeline Estimate

| Phase | Estimated Time |
|-------|----------------|
| Project Setup & Configuration | 2-3 hours |
| Database Schema & Models | 2-3 hours |
| Authentication System | 3-4 hours |
| Team Creation (with background jobs) | 4-5 hours |
| Team Dashboard UI | 3-4 hours |
| Transfer Market Backend | 3-4 hours |
| Transfer Market UI | 3-4 hours |
| Testing & Bug Fixes | 3-4 hours |
| Documentation | 1-2 hours |
| **Total** | **24-33 hours** |

---

*Document Version: 1.0*
*Created: November 2024*

