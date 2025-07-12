# Frisconnections

A daily San Francisco-themed word puzzle game where players find groups of four related items from a 16-word grid.

## Game Overview

Players are presented with 16 words arranged in a 4x4 grid. The goal is to identify four groups of four words that share a common connection. Each group has a difficulty level indicated by color:

- **Yellow (Easy)**: Most straightforward connections
- **Green (Medium)**: Moderate difficulty  
- **Blue (Hard)**: Requires local SF knowledge
- **Purple (Expert)**: Wordplay, double meanings, very SF-specific

Players have 4 attempts to make incorrect guesses before the game ends.

### Example Categories
- **SF Hills**: Twin Peaks, Nob Hill, Russian Hill, Telegraph Hill
- **Things in Golden Gate Park**: Bison, Museum, Windmill, Gardens
- **Food Invented in SF**: Irish Coffee, Sourdough, Mission Burrito, Cioppino
- **Tech Terms with SF Meanings**: Oracle, Salesforce, Uber, Twitter

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (planned)
- **State Management**: React built-in hooks

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and game-specific CSS classes
│   ├── layout.tsx           # Root layout with header
│   └── page.tsx             # Main game page (fetches daily puzzle)
├── components/Game/
│   ├── GameBoard.tsx        # Main game orchestrator component
│   ├── GameControls.tsx     # Submit, shuffle, deselect buttons
│   ├── SolvedGroups.tsx     # Display solved categories
│   └── TileGrid.tsx         # 4x4 grid of selectable word tiles
├── lib/
│   ├── gameLogic.ts         # Core game state management and logic
│   ├── localStorage.ts      # Browser storage for progress and stats
│   ├── puzzleApi.ts         # Supabase puzzle fetching functions
│   └── supabase.ts          # Supabase client configuration
├── types/
│   └── game.ts              # TypeScript interfaces for game data
└── data/
    └── mockPuzzle.ts        # Sample puzzle data for testing
```

## Database Schema

The game uses five main tables in Supabase:

- **puzzle_queue**: Staging area for puzzles before publication
- **puzzles**: Published daily puzzles with dates
- **categories**: Four categories per puzzle with difficulty and items
- **anonymous_sessions**: Track individual game sessions
- **anonymous_guesses**: Record each guess attempt

Key features:
- Automatic puzzle numbering with triggers
- Queue-based daily puzzle assignment
- Validation functions to prevent duplicate items/categories
- Anonymous session tracking (no user accounts required)

## Game Mechanics

### Tile Selection
- Click tiles to select (up to 4 maximum)
- Selected tiles highlight in blue
- Click again to deselect

### Submission
- Submit button activates when exactly 4 tiles are selected
- Correct guesses group tiles and reveal the category name
- Incorrect guesses shake tiles red and consume one attempt
- Game ends after 4 incorrect attempts or solving all groups

### Visual Feedback
- Difficulty-based color coding for solved groups
- Smooth animations for correct/incorrect guesses
- Progress tracking with remaining attempts counter

### Local Storage
- Game progress persists through page refreshes
- Statistics tracking: games played, win rate, streaks
- No cloud sync - data tied to specific browser

## Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrfinnsmith/FrisConnections.git
   cd FrisConnections
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `docs/tech-spec.md` to create tables and functions
   - Get your project URL and anon key from Settings > API

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Add sample puzzle data**
   Insert test data into your Supabase database (see database setup in tech spec)

6. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Features Implemented

✅ **Core Game Engine**
- 4x4 tile grid with selection mechanics
- Game state management (attempts, solved groups, win/lose)
- Local storage for progress persistence

✅ **Database Integration**
- Supabase connection for puzzle fetching
- Daily puzzle assignment system
- Robust database schema with validation

✅ **Responsive Design**
- Mobile-friendly interface
- Difficulty-based color coding
- Smooth animations and transitions

✅ **Game Logic**
- Four attempt limit
- Category grouping and validation
- Progress tracking and statistics

## Features Not Yet Implemented

🔲 **Session Tracking**: Recording guesses and sessions in database
🔲 **Social Sharing**: Emoji grid generation and clipboard sharing
🔲 **Daily Puzzle Assignment**: Automated cron job for new puzzles
🔲 **Admin Interface**: Content management for adding new puzzles
🔲 **Production Deployment**: Vercel hosting configuration
🔲 **Analytics**: Puzzle difficulty calibration and user metrics

## Customization for Other Cities

This codebase is designed to be easily adapted for other cities:

1. **Update branding**: Change app name, title, and description in `layout.tsx`
2. **Create new categories**: Replace SF-specific categories with your city's themes
3. **Modify styling**: Update colors and fonts in `globals.css` and Tailwind config
4. **Add city data**: Populate database with location-specific puzzle content

The game mechanics and technical infrastructure remain the same - only the content and branding need customization.

## Technical Decisions

### Why Supabase?
- Real-time capabilities for future features
- Built-in authentication (if needed later)
- Generous free tier suitable for daily puzzle games
- SQL functions for complex puzzle assignment logic

### Why Next.js App Router?
- Server-side rendering for better SEO
- Built-in API routes for backend functionality
- Modern React patterns with TypeScript support
- Optimized for Vercel deployment

### Why Local Storage?
- No user accounts required (lower barrier to play)
- Instant game state persistence
- Privacy-focused (no personal data collection)
- Simpler than managing user sessions

## Performance Considerations

- Puzzle data cached on server-side
- Minimal bundle size with tree-shaking
- Optimized for mobile devices
- Progressive enhancement (works without JavaScript for basic functionality)

## License

This project is for educational and non-commercial use only. Not affiliated with or endorsed by any existing puzzle games or publications.