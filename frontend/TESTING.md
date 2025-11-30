# Frontend Testing Documentation

## Overview
This document describes the testing setup and custom hooks implemented for the Football Fantasy frontend application.

## Testing Stack
- **Vitest**: Fast unit test framework for Vite projects
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation

## Setup
All tests are configured via `vitest.config.ts` with:
- `jsdom` environment for DOM testing
- Global test utilities
- Setup file at `src/test/setup.ts`

## Running Tests
```bash
# Run tests once
npm test

# Run tests in watch mode  
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Custom Hooks

### `useTeam`
**Location**: `src/hooks/useTeam.ts`

Fetches team data using React Query with automatic caching and refetching.

**Tests**: Integrated with React Query tests

**Usage**:
```tsx
const { data: team, isLoading, error } = useTeam();
```

**Benefits**:
- Automatic caching
- Background refetching
- Request deduplication
- Optimistic updates via mutations

### `useSquadSplit`
**Location**: `src/hooks/useSquadSplit.ts`

Splits players array into starters and bench based on `isStarter` property.

**Tests**: `src/hooks/useSquadSplit.test.ts` (4 tests)
- ✅ Splits players correctly
- ✅ Handles undefined input
- ✅ Handles empty array
- ✅ Memoizes result

**Usage**:
```tsx
const { starters, bench } = useSquadSplit(team?.players);
```

### `useTransferActions`
**Location**: `src/hooks/useTransferActions.ts`

Provides memoized callbacks for transfer list actions.

**Tests**: `src/hooks/useTransferActions.test.ts` (5 tests)
- ✅ Provides transfer functions
- ✅ Calls with correct arguments
- ✅ Memoizes callbacks

**Usage**:
```tsx
const { handleListForTransfer, handleRemoveFromTransferList } = useTransferActions();
```

### `useLoadingDots`
**Location**: `src/hooks/useLoadingDots.ts`

Animated dots for loading states (".","..","...").

**Tests**: `src/hooks/useLoadingDots.test.ts` (4 tests)
- ✅ Starts with empty string
- ✅ Adds dots over time
- ✅ Resets after three dots
- ✅ Cleans up on unmount

**Usage**:
```tsx
const dots = useLoadingDots();
return <h2>Loading{dots}</h2>;
```

### `useTeamStatusPolling`
**Location**: `src/hooks/useTeamStatusPolling.ts`

Polls team status endpoint using React Query's `refetchInterval` and navigates to dashboard when ready.

**Tests**: Not yet implemented (requires mocking navigation and API)

**Usage**:
```tsx
const { error, retry } = useTeamStatusPolling();
```

**Benefits**:
- Uses React Query's built-in polling
- Automatic retry logic
- Smart polling that stops when ready
- Better error handling

## Component Tests

### `PlayerCard`
**Location**: `src/components/PlayerCard.test.tsx` (8 tests)

Tests player card rendering, transfer modal, and user interactions:
- ✅ Renders player information
- ✅ Shows transfer buttons based on state
- ✅ Opens/closes transfer modal
- ✅ Calls callbacks with correct data
- ✅ Applies correct position colors

### `SoccerPitch`
**Location**: `src/components/SoccerPitch.test.tsx` (5 tests)

Tests pitch visualization:
- ✅ Renders all 11 players
- ✅ Groups by position correctly
- ✅ Displays player initials
- ✅ Handles empty array
- ✅ Applies correct colors

## Context Tests

### `AuthContext`
**Location**: `src/context/AuthContext.test.tsx` (6 tests)

Tests authentication state management:
- ✅ Renders children
- ✅ Initializes with localStorage
- ✅ Throws error outside provider
- ✅ Login function works
- ✅ Logout function works

## Test Utilities

### `test-utils.tsx`
Provides wrapped `render` function with all providers:
- QueryClientProvider
- AuthProvider
- BrowserRouter

**Usage**:
```tsx
import { render, screen } from '../test/test-utils';

test('my test', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## Test Coverage
Current coverage: **32 tests passing**
- 13 Hook tests
- 13 Component tests  
- 6 Context tests

## Best Practices
1. ✅ Extract business logic into hooks
2. ✅ Test hooks independently
3. ✅ Use semantic queries (getByRole, getByLabelText)
4. ✅ Test user behavior, not implementation
5. ✅ Mock external dependencies (API, navigation)
6. ✅ Use custom render with providers

