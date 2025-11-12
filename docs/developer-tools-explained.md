# Developer Tools: How Mock Data Injection Works

## Overview

The stats page includes built-in developer tools that allow you to test different user scenarios without manually playing games or manipulating browser storage. This system automatically injects realistic mock data into localStorage to simulate various user experience states.

## How It Works Programmatically

### 1. Automatic Detection

The developer tools panel automatically appears when:

- The application is running in development mode (`NODE_ENV === 'development'`)
- You're viewing the `/stats` page

No configuration or special setup is required - it's built into the stats page component.

### 2. Mock Data Generation System

The system uses a sophisticated mock data generator that creates realistic user statistics:

#### Data Structure

Each mock scenario generates a complete `EnhancedUserStats` object containing:

- **Basic metrics**: games played, games won, last played date
- **Puzzle history**: chronological list of individual game results
- **Difficulty breakdown**: performance statistics for each category difficulty level (yellow, green, blue, purple)
- **Metadata**: timestamps and data validation markers

#### Realistic Data Patterns

The generator doesn't just create random data - it simulates realistic user behavior:

- **Win rates**: Overall ~73% win rate across all scenarios
- **Difficulty progression**: Yellow categories have ~80% solve rate, purple categories ~25%
- **Attempt patterns**: Winners typically use 1-3 attempts, losers always use all 4
- **Temporal consistency**: Puzzle dates are sequential and realistic
- **Statistical correlation**: Difficulty performance correlates with overall skill level

### 3. Available Scenarios

#### newUser (0 games)

- Completely empty stats
- Tests the "no data" state and onboarding experience
- Triggers first-time user messaging

#### fewGames (3 games)

- Minimal data set
- Tests early user experience
- Shows basic stats but hides advanced features
- Triggers "play more to unlock features" messaging

#### someGames (10 games)

- Moderate data set with established patterns
- Unlocks difficulty breakdown analysis
- Shows progression encouragement messaging
- Tests the transition from basic to intermediate user

#### manyGames (25 games)

- Substantial gaming history
- Full feature set available
- Rich statistical analysis possible
- Tests data visualization with meaningful sample sizes

#### veteran (50 games)

- Extensive gaming history
- Maximum feature unlock
- Complex statistical patterns
- Tests performance with large datasets

### 4. Data Injection Process

When you click a scenario button:

1. **Generation**: The system generates a complete mock dataset for that scenario
2. **Serialization**: The data is converted to JSON format with proper date handling
3. **Storage**: The JSON is stored in localStorage under the key `frisconnections-enhanced-stats`
4. **Reload**: The page automatically refreshes to load the new mock data
5. **Validation**: The stats system validates the injected data for integrity

### 5. Storage Key Management

The system manages multiple localStorage keys:

- `frisconnections-enhanced-stats`: Primary statistics storage (current format)
- `frisconnections-stats`: Legacy statistics format (maintained for compatibility)

The "Clear All Data" function removes both keys to ensure a completely clean state.

### 6. Data Validation Integration

Mock data is generated to pass all validation rules:

- **Date consistency**: Puzzle dates are sequential and within reasonable bounds
- **Logical constraints**: Win/loss ratios make sense, attempt counts are valid
- **Data completeness**: All required fields are populated
- **Type safety**: All values match expected TypeScript types

### 7. Progressive Disclosure Testing

The mock scenarios are specifically designed to test the progressive disclosure system:

- **0-2 games**: Basic stats only, encouragement to play more
- **3-9 games**: Difficulty breakdown unlocked, advanced stats teased
- **10+ games**: Full feature set including advanced statistics

Each scenario boundary is testable with the appropriate mock data set.

### 8. Development vs Production Behavior

**Development Mode:**

- Developer tools panel is visible
- Mock data injection is available
- Console logging shows injection details
- Data can be easily cleared and reset

**Production Mode:**

- Developer tools panel is completely hidden
- Mock data functions are still present but not accessible via UI
- Only real user data is displayed
- Security and performance optimized

## Technical Implementation Notes

### Date Handling

Mock data generator creates dates that:

- Start from recent dates and work backwards
- Account for the daily puzzle cadence (one puzzle per day)
- Handle timezone considerations properly
- Maintain chronological consistency

### Performance Considerations

- Mock data is generated on-demand, not pre-computed
- Large datasets (veteran scenario) are created efficiently
- localStorage operations are batched to minimize browser overhead
- Page reload ensures clean state without memory leaks

### Data Integrity

- All mock data passes the same validation rules as real user data
- Edge cases (perfect games, losing streaks) are included in generated data
- Statistical distributions match expected real-world patterns
- Backward compatibility with legacy data formats is maintained

## Usage Tips

1. **Testing User Flows**: Use scenarios in sequence (newUser → fewGames → someGames) to test user progression
2. **Feature Testing**: Jump directly to scenarios that unlock specific features you're testing
3. **Performance Testing**: Use the veteran scenario to test with large datasets
4. **Clean Slate**: Use "Clear All Data" to return to authentic no-data state
5. **Data Inspection**: Use browser dev tools to inspect the injected localStorage data structure
