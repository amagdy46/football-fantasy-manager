# React Query Integration

## Why React Query?

React Query is justified in this project for several key use cases:

### 1. **Server State Management**
- Automatic caching and invalidation
- Background refetching
- Request deduplication
- Optimistic updates

### 2. **Real Use Cases in Our App**

#### ✅ Team Data Fetching (`useTeam`)
```tsx
const { data: team, isLoading, error } = useTeam();
```
**Benefits**:
- Cached team data across components
- Automatic background refresh
- No need for manual state management
- Automatic retry on failure

#### ✅ Team Name Updates (Mutation)
```tsx
const updateNameMutation = useMutation({
  mutationFn: (newName: string) => updateTeamName(newName),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['team'] });
  },
});
```
**Benefits**:
- Loading states handled automatically
- Cache invalidation on success
- Rollback on error (future: optimistic updates)

#### ✅ Team Status Polling (`useTeamStatusPolling`)
```tsx
const { data } = useQuery({
  queryKey: ["teamStatus"],
  queryFn: fetchTeamStatus,
  refetchInterval: (query) => {
    const isReady = query.state.data?.isReady;
    return isReady ? false : 2000; // Poll every 2s until ready
  },
});
```
**Benefits**:
- Built-in polling with `refetchInterval`
- Smart polling that stops automatically
- Automatic retry logic
- Better than manual `setInterval` management

### 3. **Future Use Cases**

#### Transfer Market (Upcoming)
```tsx
// Fetch available players
const { data: players } = useQuery({
  queryKey: ['market', filters],
  queryFn: () => fetchMarketPlayers(filters),
  staleTime: 30000, // Consider fresh for 30s
});

// Buy a player
const buyMutation = useMutation({
  mutationFn: buyPlayer,
  onSuccess: () => {
    queryClient.invalidateQueries(['team']);
    queryClient.invalidateQueries(['market']);
  },
});
```

#### Live Match Updates (Future)
```tsx
const { data: matchData } = useQuery({
  queryKey: ['match', matchId],
  queryFn: () => fetchMatch(matchId),
  refetchInterval: 5000, // Real-time updates
  enabled: isMatchLive,
});
```

#### Leaderboards
```tsx
const { data: leaderboard } = useQuery({
  queryKey: ['leaderboard', season],
  queryFn: () => fetchLeaderboard(season),
  staleTime: 60000, // Cache for 1 minute
});
```

## Architecture

### Query Keys
```tsx
['team']           // User's team data
['teamStatus']     // Team creation status
['market', {...}]  // Transfer market (future)
['match', id]      // Match data (future)
['leaderboard']    // Rankings (future)
```

### Query Client Configuration
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,          // Consider data fresh for 5s
      cacheTime: 10 * 60 * 1000, // Keep in cache for 10min
      retry: 3,                  // Retry failed requests 3 times
      refetchOnWindowFocus: true, // Refetch when user returns
    },
  },
});
```

## When NOT to Use React Query

❌ **Local UI State**: Use `useState`
- Modal open/closed
- Form inputs
- Animation states

❌ **Global App State**: Consider Context
- Authentication
- Theme preferences
- UI settings

❌ **Derived State**: Use `useMemo`
- Filtered lists
- Calculations
- Transformations

## Comparison: With vs Without

### Without React Query (Manual)
```tsx
const [team, setTeam] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  let interval;
  const fetch = async () => {
    try {
      setIsLoading(true);
      const data = await getTeam();
      setTeam(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetch();
  interval = setInterval(fetch, 30000); // Refetch every 30s
  
  return () => clearInterval(interval);
}, []);
```

### With React Query
```tsx
const { data: team, isLoading, error } = useQuery({
  queryKey: ['team'],
  queryFn: getTeam,
  refetchInterval: 30000,
});
```

## Best Practices

1. **Consistent Query Keys**: Use array format with clear hierarchy
2. **Smart Caching**: Set appropriate `staleTime` based on data freshness needs
3. **Invalidation**: Invalidate related queries after mutations
4. **Optimistic Updates**: For instant UI feedback (coming in transfer market)
5. **Error Boundaries**: Wrap components for graceful error handling

## Dependencies
```json
{
  "@tanstack/react-query": "^5.x",
  "@tanstack/react-query-devtools": "^5.x" // Optional dev tools
}
```

## Testing
React Query works seamlessly with React Testing Library. See `test-utils.tsx` for provider setup.

## Conclusion
React Query is well-justified for this project due to:
- ✅ Multiple server state use cases
- ✅ Real-time polling requirements
- ✅ Future transfer market complexity
- ✅ Better DX than manual state management
- ✅ Performance optimizations out of the box

The library pays for itself in reduced boilerplate and fewer bugs related to async state management.

