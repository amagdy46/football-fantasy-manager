# Football Fantasy Manager

A full-stack fantasy football management web application where users can manage their team, buy and sell players in a transfer market, and compete with others.

## Features

### 🔐 Authentication

- **Secure Sign-up & Login**: User registration and login flows with JWT authentication.
- **Protected Routes**: Secure navigation ensuring only authenticated users can access the dashboard and market.

### ⚽ Team Management

- **Automatic Team Creation**: New users are automatically assigned a randomly generated squad of 20 players (3 GK, 6 DEF, 6 MID, 5 ATT).
- **Interactive Dashboard**: View your starting XI on a visualized football pitch and manage your bench.
- **Player Details**: Detailed player cards showing position, stats (goals/assists), market value, and transfer status.
- **Team Customization**: Edit your team name and manage your roster.

### 💸 Transfer Market

- **Live Transfer List**: List your own players for sale with a custom asking price.
- **Real-time Market**: Browse players listed by other users with real-time updates.
- **Smart Filtering**: Filter players by name, team, position, and price range.
- **Purchase System**: Buy players from other teams using your budget.
- **Transaction Rules**:
  - Maximum 25 players per team.
  - Sellers must maintain at least 15 players.
  - Users cannot buy their own players.
  - 95% of the transaction value goes to the seller (5% tax).

### ⚡ Technical Highlights

- **Modular Architecture**: scalable and maintainable code structure for both frontend and backend.
- **Background Jobs**: Asynchronous team generation using Redis and BullMQ.
- **Optimized Performance**: React Query for efficient data fetching and caching.
- **Database Transactions**: Safe transfer logic ensuring data integrity during player sales.
- **Modern UI**: Dark-themed, responsive interface built with React, Tailwind CSS, and Shadcn UI.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker & Docker Compose** (for database and Redis)
- **npm** (or yarn/pnpm)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/amagdy46/football-fantasy-manager.git
cd football-fantasy-manager
```

### 2. Start Infrastructure (PostgreSQL & Redis)

Use Docker Compose to start the database and Redis services.

```bash
docker-compose up -d postgres redis
```

### 3. Backend Setup

Navigate to the backend directory, install dependencies, and set up the database.

```bash
cd backend

# Install dependencies
npm install

# Run database migrations and seed initial player pool
npm run db:setup


# Start the development server
npm run dev

```

The backend server will start on `http://localhost:3001`.

### 4. Frontend Setup

Open a new terminal, navigate to the frontend directory, and start the client.

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev

```

The frontend application will start on `http://localhost:5173`.

## Environment Variables

The application comes with default `.env.example` files. You can copy them to `.env` or use the defaults for local development.

### Backend (`backend/.env`)

```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/football_fantasy?schema=public"
JWT_SECRET="your-secret-key"
REDIS_URL="redis://localhost:6379"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:3001/api"
```

## Running Tests

The project includes unit and integration tests for both ends of the stack.

**Backend Tests (Vitest):**

```bash
cd backend
npm test
```

**Frontend Tests (Vitest + React Testing Library):**

```bash
cd frontend
npm test
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, React Query, React Router.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, BullMQ.
- **Database**: PostgreSQL.
- **Cache/Queue**: Redis.
- **Testing**: Vitest, Supertest, React Testing Library.

## License

This project is open-source and available under the MIT License.
