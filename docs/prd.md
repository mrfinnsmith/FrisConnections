# Frisconnections - Product Requirements Document

## Executive Summary

Frisconnections is a daily word puzzle game based on the New York Times Connections format, featuring San Francisco-themed categories. Players identify groups of four related SF items from a grid of 16 words.

## Game Overview

### Core Mechanics

- **Daily puzzle**: One puzzle per day, resets at midnight Pacific
- **16 items**: 4 groups of 4 related SF items each
- **4 attempts**: Players can make 4 incorrect groupings before losing
- **Difficulty levels**: 4 categories with increasing difficulty (Yellow → Green → Blue → Purple)
- **Sharing**: Results shareable as colored emoji grid

### Example Puzzle Structure

```
Grid: [Twin Peaks, Recalled, Mint Mojito, Castro, Irish Coffee, Brandons,
       Nob Hill, Sourdough, Oracle, Russian Hill, Bowl, Starter,
       Ocean Beach, Mission Burrito, Micro, Golden Gate]

Groups:
🟨 HILLS: Twin Peaks, Nob Hill, Russian Hill, Telegraph Hill
🟩 THINGS IN GOLDEN GATE PARK: Gardens, Micro, Golden, Bowl
🟦 FOOD INVENTED IN SF: Irish Coffee, Sourdough, Mission Burrito, Mint Mojito
🟪 TECH DOUBLE MEANINGS: Oracle, Starter, Bowl, Micro
```

## User Experience

### Game Flow

#### Entry Point

- Landing page displays game title and current date
- "How to Play" modal for new users
- Start game immediately or view instructions

#### Puzzle Start

- 16 word tiles arranged in 4x4 grid
- Each tile is clickable button with single word
- No initial grouping or hints visible
- Daily puzzle indicator showing current date

#### Actionable UI Elements

- "Submit" button (disabled until four tiles selected)
- "Shuffle" button to rearrange tile positions
- "Deselect All" button
- Remaining mistakes counter ("Mistakes left: 4")
- Progress indicator for solved groups

#### Gameplay Loop

1. **Tile Selection**: Click tiles to select up to four. Selected tiles highlight with color/border
2. **Submission**: Click "Submit" when four tiles selected
3. **Feedback**:
   - **Correct**: Tiles animate and group together, labeled with connection
   - **Incorrect**: Tiles shake/flash red, mistake counter decrements
4. **Repeat**: Continue until all groups found or mistakes exhausted

#### End States

- **Success**: Celebratory animation, summary screen, share options
- **Failure**: Game over message, option to reveal answers, try again tomorrow

### UI States

#### Default State

- 16 tiles in grid, unselected
- "Submit" button disabled
- Mistake counter at 4
- Shuffle button visible

#### Selection State

- Up to four tiles highlighted
- "Submit" enabled when four selected
- "Deselect All" visible

#### Correct Submission

- Selected tiles animate and move to grouped area
- Group labeled with connection
- Tiles locked, cannot be selected again

#### Incorrect Submission

- Tiles shake/flash red
- Mistake counter decreases
- Tiles return to unselected state

#### Completion State

- All tiles grouped and labeled
- Summary overlay with results
- Share options and replay navigation

#### Failure State

- "Game Over" overlay
- Option to reveal answers
- Encouragement and next puzzle prompt

### Feedback Mechanisms

#### Visual Feedback

- **Selection**: Tiles highlight with color/border
- **Correct Group**: Tiles animate (bounce, glow), move, and are labeled
- **Incorrect Group**: Tiles shake or flash red
- **Progress**: Indicator updates as groups solved
- **Mistakes**: Counter visibly updates

#### Auditory Feedback

- Subtle sounds for selection, correct, and incorrect actions
- Celebratory sound on completion

#### Textual Feedback

- Group labels reveal connection after correct submission
- Error messages for invalid submissions
- End-of-game summary with all group connections

#### Social Feedback

- Shareable emoji grid reflecting performance
- Social sharing buttons

### Accessibility

- High-contrast mode for colorblind users
- Keyboard navigation for tile selection and submission
- Screen reader support for tile content and feedback
- Animations can be disabled

### Error Handling

- **Too Few/Many Tiles**: "Submit" disabled, tooltip prompts user
- **Repeated Mistakes**: Visual warning as mistakes approach zero
- **Accidental Submission**: "Deselect All" easily accessible
- **Network Issues**: Offline mode allows puzzle play

## User Progress Tracking

### Local Browser Storage

- **Streak tracking**: Stored in browser localStorage only
- **Statistics**: Current streak, best streak, games played, win percentage
- **No cloud sync**: Data tied to specific browser/device
- **Data loss scenarios**: Clearing browser cache, incognito mode, different devices
- **Streak mechanics**:
  - Increases each day puzzle is solved correctly
  - Resets to zero if day is missed or puzzle failed
  - Based on calendar days in user's local timezone
- **Stats display**: Shown after game completion and accessible via stats icon

### Game State Management

- **Browser storage**: Current game state persists on page refresh
- **Session continuity**: Game resumes where left off within same day
- **Corrupted localStorage**: Reset to fresh state without crashing

## Performance Requirements

### Load Time

- **Initial page load**: < 2 seconds on 3G connection
- **Puzzle data fetch**: < 500ms
- **Game state updates**: < 100ms response time

### Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Android Chrome 90+
- **Progressive enhancement**: Core game works without JavaScript animations

### Resource Usage

- **Bundle size**: < 500KB gzipped
- **Memory usage**: < 50MB peak
- **Offline capability**: Today's puzzle cached for offline play

## Content Strategy

### Difficulty Progression

- **Yellow (Easiest)**: Clear, unambiguous groupings (SF Hills, Recalled Politicians)
- **Green (Easy)**: Slightly more abstract but still obvious (Food invented in SF)
- **Blue (Medium)**: Requires local knowledge (Giants viewing locations)
- **Purple (Hardest)**: Wordplay, double meanings, very SF-specific (Tech buzzwords with multiple meanings)

## Success Metrics

### Engagement

- **Completion Rate**: 70%+ of started puzzles completed
- **Local Engagement**: 60%+ of users from Bay Area
- **Sharing**: 20%+ of completed puzzles shared

### Content Quality

- **Difficulty Balance**: Yellow 80% solve rate, Purple 20% solve rate
- **Category Recognition**: <5% "never heard of this" feedback

## Risk Mitigation

### Content Risks

- **Obscurity**: Track solve rates, remove categories <10% recognition
- **Controversy**: Avoid political/sensitive topics beyond widely-known recalls

### Technical Risks

- **Scale**: Supabase can handle expected load
- **Data Loss**: Regular backups, version control for content
- **Performance**: Optimize for mobile, cache daily puzzles
- **Puzzle Availability**: Robust validation and admin alerting system
