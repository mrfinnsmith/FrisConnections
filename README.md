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
- **Deployment**: Vercel
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

The game uses six main tables in Supabase:

### Core Tables

- **puzzles**: Published daily puzzles with auto-assigned numbers
- **categories**: Four categories per puzzle with difficulty and items
- **puzzle_queue**: Queue management for publishing puzzles with archiving
- **category_staging**: Temporary staging for CSV imports

### Session Tracking

- **anonymous_sessions**: Track individual game sessions
- **anonymous_guesses**: Record each guess attempt

## Content Management Workflow

### Step 1: Prepare CSV File

Create a CSV file with this exact format:

```csv
name,difficulty,item1,item2,item3,item4
SF Hills,1,Twin Peaks,Nob Hill,Russian Hill,Telegraph Hill
Food Invented in SF,3,Irish Coffee,Sourdough,Mission Burrito,Cioppino
Tech Companies,2,Oracle,Salesforce,Uber,Twitter
MUNI Lines,4,N Judah,L Taraval,K Ingleside,M Ocean View
```

**CSV Requirements:**
- Difficulty: 1=Yellow (easiest), 2=Green, 3=Blue, 4=Purple (hardest)
- Exactly 4 items per category
- Category names should be unique and descriptive
- Items should be single words or short phrases

### Step 2: Import CSV to Staging Table

1. Go to Supabase dashboard → Table Editor → category_staging table
2. Click Insert → Import Data from CSV
3. Upload your CSV file
4. Verify the import completed successfully

### Step 3: Move Categories from Staging to Categories Table

```sql
-- Transfer categories from staging to main categories table
INSERT INTO categories (name, difficulty, items, puzzle_id)
SELECT 
    name,
    difficulty,
    ARRAY[item1, item2, item3, item4] as items,
    NULL as puzzle_id
FROM category_staging
WHERE name IS NOT NULL;

-- Clear staging table after successful transfer
TRUNCATE category_staging;
```

### Step 4: Create Puzzles from Categories

**Plan Your Puzzle:**
- Pick exactly 4 categories with different difficulty levels (1, 2, 3, 4)
- Check for duplicate items across the 4 categories

**Create Puzzle and Assign Categories:**

```sql
-- Create new puzzle
INSERT INTO puzzles (puzzle_number) 
VALUES ((SELECT COALESCE(MAX(puzzle_number), 0) + 1 FROM puzzles));

-- Get the puzzle ID you just created
SELECT id FROM puzzles ORDER BY created_at DESC LIMIT 1;

-- Assign 4 categories to this puzzle (replace IDs with your chosen categories)
UPDATE categories 
SET puzzle_id = YOUR_PUZZLE_ID 
WHERE id IN (cat1_id, cat2_id, cat3_id, cat4_id);
```

**Validation:**
The database automatically validates:
- Exactly 4 categories per puzzle
- One category of each difficulty (1,2,3,4)  
- No duplicate items across categories
- Exactly 16 total items

### Step 5: Add Puzzle to Queue

```sql
-- Add puzzle to publishing queue (queue_position auto-assigned)
INSERT INTO puzzle_queue (puzzle_id, published, archived) 
VALUES (YOUR_PUZZLE_ID, false, false);
```

### Step 6: Publish Daily Puzzle

```sql
-- Automatically assign next puzzle for daily play and archive previous puzzle
SELECT assign_daily_puzzle();
```

## Database Functions

### Core Functions

- **`get_daily_puzzle()`**: Returns the current published puzzle with all categories (validates exactly 1 published puzzle)
- **`assign_daily_puzzle()`**: Unpublishes current puzzle, archives it, then publishes next queued puzzle
- **`validate_puzzle_composition()`**: Validates puzzle integrity on category assignment
- **`normalize_and_validate_category()`**: Auto-formats and validates category data
- **`auto_assign_queue_position()`**: Auto-assigns queue position when adding puzzles to queue

## Daily Puzzle System

The puzzle queue operates as a simple advancing queue:

1. Only **one puzzle** has `published = true` at any time (or zero if queue is empty)
2. `assign_daily_puzzle()` function:
   - Unpublishes current puzzle (`published = false`)
   - Archives unpublished puzzle (`archived = true`) to prevent re-publishing
   - Publishes next puzzle in queue order (if available)
3. `get_daily_puzzle()` returns the single published puzzle
4. If no puzzles are published or multiple puzzles are published, site shows "no puzzle available"
5. Archived puzzles can never be published again, preventing accidental re-publishing

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
   - Run the SQL schema to create tables and functions
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

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Constraints

### Categories Table

**Data Normalization:**
- Category names and items automatically converted to UPPER() and TRIM()
- Prevents empty category names and items

**Structure Constraints:**
- `difficulty`: Must be 1, 2, 3, or 4
- `items`: Must contain exactly 4 items
- `name`, `difficulty`, `items`: NOT NULL required
- No duplicate items within same category

**Puzzle Validation:**
- Puzzles must have exactly 4 categories
- Puzzles must have exactly one category of each difficulty (1, 2, 3, 4)
- No duplicate items across categories within same puzzle
- Exactly 16 total items per puzzle

### Puzzle Queue Table

**Structure Constraints:**
- `puzzle_id`: Primary key, references puzzles table
- `queue_position`: Unique positioning for queue order
- `published`: Boolean flag for current publication status
- `archived`: Boolean flag preventing re-publication

## Content Guidelines

**Category Creation Best Practices:**
- **Yellow (1) - #F9DF6F**: Obvious connections everyone will know (SF Hills, SF Sports Teams)
- **Green (2) - #A0C35A**: Moderate difficulty requiring some local knowledge (SF Neighborhoods, MUNI Lines)
- **Blue (3) - #B0C4EF**: Harder connections requiring specific SF knowledge (Foods Invented in SF, SF Movies)
- **Purple (4) - #BA81C5**: Wordplay, double meanings, very SF-specific (Tech terms with SF meanings)

**Common Mistakes to Avoid:**
- Items that could belong to multiple categories
- Overly obscure references (aim for 80% recognition rate)
- Category names that give away the connection too easily
- Items that are too long for mobile display

## Queue Management

**View Queue Status:**
```sql
SELECT pq.puzzle_id, pq.queue_position, pq.published, pq.archived,
       p.puzzle_number,
       COUNT(c.id) as category_count,
       STRING_AGG(c.name, ', ' ORDER BY c.difficulty) as categories
FROM puzzle_queue pq
JOIN puzzles p ON pq.puzzle_id = p.id
LEFT JOIN categories c ON p.id = c.puzzle_id
GROUP BY pq.puzzle_id, pq.queue_position, pq.published, pq.archived, p.puzzle_number
ORDER BY pq.queue_position;
```

**Reorder Queue:**
```sql
-- Update queue positions manually
UPDATE puzzle_queue SET queue_position = NEW_POSITION WHERE puzzle_id = PUZZLE_ID;
```

## Features Implemented

✅ **Core Game Engine**
- 4x4 tile grid with selection mechanics
- Game state management (attempts, solved groups, win/lose)
- Local storage for progress persistence

✅ **Database Integration**
- Supabase connection for puzzle fetching
- Daily puzzle assignment system with archiving
- Robust database schema with validation

✅ **Responsive Design**
- Mobile-friendly interface
- Difficulty-based color coding
- Smooth animations and transitions

✅ **Content Management**
- CSV import workflow via staging table
- Automated data validation and normalization
- Queue-based puzzle publishing system with archive protection

## Features Not Yet Implemented

🔲 **Session Tracking**: Recording guesses and sessions in database
🔲 **Social Sharing**: Emoji grid generation and clipboard sharing
🔲 **Daily Puzzle Assignment**: Automated cron job for new puzzles
🔲 **Admin Interface**: Content management for adding new puzzles
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