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
- **Automation**: GitHub Actions for daily puzzle scheduling
- **State Management**: React built-in hooks

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── daily-puzzle.yml # GitHub Actions workflow for daily automation
├── docs/                    # Project documentation
│   ├── prd.md              # Product requirements document
│   ├── status-memo.md      # Development status tracking
│   └── tech-spec.md        # Technical specifications
├── public/
│   ├── og-image.png        # Open Graph social sharing image
│   └── robots.txt          # Search engine crawler instructions
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx     # About page with creator info
│   │   ├── api/
│   │   │   ├── advance-puzzle/
│   │   │   │   └── route.ts # API endpoint for puzzle advancement
│   │   │   ├── past-puzzles/
│   │   │   │   └── route.ts # API endpoint for puzzle archive list
│   │   │   └── puzzle/
│   │   │       └── [number]/
│   │   │           └── route.ts # API endpoint for specific puzzle by number
│   │   ├── globals.css      # Global styles and game-specific CSS classes
│   │   ├── how-to-play/
│   │   │   └── page.tsx     # Game instructions page
│   │   ├── layout.tsx       # Root layout with header navigation
│   │   ├── page.tsx         # Main game page (fetches daily puzzle)
│   │   ├── past/
│   │   │   └── page.tsx     # Past puzzles archive page
│   │   ├── puzzle/
│   │   │   └── [number]/
│   │   │       └── page.tsx # Individual past puzzle game page
│   │   └── sitemap.ts       # Dynamic sitemap generation
│   ├── components/
│   │   └── Game/
│   │       ├── GameBoard.tsx    # Main game orchestrator component
│   │       ├── GameControls.tsx # Submit, shuffle, deselect buttons
│   │       ├── ResultsModal.tsx # Game results and sharing modal
│   │       ├── SolvedGroups.tsx # Display solved categories
│   │       ├── TileGrid.tsx     # 4x4 grid of selectable word tiles
│   │       └── Toast.tsx        # Toast notification component
│   ├── data/
│   │   └── mockPuzzle.ts    # Sample puzzle data for testing
│   ├── lib/
│   │   ├── gameLogic.ts     # Core game state management and logic
│   │   ├── localStorage.ts  # Browser storage for progress and stats
│   │   ├── puzzleApi.ts     # Supabase puzzle fetching functions
│   │   ├── session_api.ts   # Anonymous session tracking functions
│   │   └── supabase.ts      # Supabase client configuration
│   └── types/
│       └── game.ts          # TypeScript interfaces for game data
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Database Schema

The game uses seven main tables in Supabase:

### Core Tables

- **puzzles**: Published daily puzzles with auto-assigned numbers
- **categories**: Four categories per puzzle with difficulty and items
- **puzzle_queue**: Queue management for publishing puzzles with archiving
- **category_staging**: Temporary staging for CSV imports

### Session Tracking

- **anonymous_sessions**: Track individual game sessions
- **anonymous_guesses**: Record each guess attempt

### Puzzle History

- **puzzle_presentations**: Records when puzzles were presented to players
  - `id`: Primary key (auto-increment)
  - `puzzle_id`: References puzzles table
  - `presented_date`: Date when puzzle was shown as daily puzzle
  - `created_at`: Timestamp of record creation
  - Unique constraint on (puzzle_id, presented_date)
  - Used for puzzle recycling algorithm and past puzzle archive

### Anonymous Session Tracking Details

The session tracking system operates automatically in the background:

- **Session Creation**: New anonymous session created when user starts a puzzle
- **Guess Recording**: Every guess attempt stored with items, difficulty, and result
- **Session Updates**: Progress tracked in real-time (attempts used, categories solved)
- **Session Completion**: Final stats recorded when game ends (win/loss)
- **Privacy**: Uses browser-generated UUIDs, no personal identification
- **Analytics Ready**: Data structure supports future difficulty analysis and usage metrics

## Automated Daily Puzzle System

The daily puzzle system automatically advances to the next puzzle at 12:00 AM Pacific time (8:00 AM UTC) using GitHub Actions, with intelligent puzzle recycling when the queue is empty.

### How It Works

1. **GitHub Actions Workflow** (`.github/workflows/daily-puzzle.yml`):
   - Runs on a cron schedule: `0 8 * * *` (12 AM Pacific)
   - Can also be triggered manually from the GitHub Actions tab
   - Makes a POST request to the `/api/advance-puzzle` endpoint

2. **API Endpoint** (`src/app/api/advance-puzzle/route.ts`):
   - Receives the POST request from GitHub Actions
   - Calls the Supabase `assign_daily_puzzle()` function
   - Returns success/error status

3. **Database Function** (`assign_daily_puzzle()`):
   - Uses `get_next_puzzle()` to find next puzzle via recycling algorithm
   - Archives the current published puzzle
   - Publishes the selected puzzle
   - Records presentation in puzzle_presentations table
   - Maintains exactly one published puzzle at all times

### Puzzle Recycling System

When the original puzzle queue is empty, the system automatically recycles past puzzles using a 5-tier algorithm:

**Tier 1**: Unplayed puzzles from puzzle_queue (highest priority)
**Tier 2**: Random puzzle not presented in 6+ months
**Tier 3**: Random puzzle not presented in 3+ months  
**Tier 4**: Random puzzle not presented in 1+ month
**Tier 5**: Random puzzle not presented in past 3 days (prevents immediate repeats)

### GitHub Secrets Configuration

The automation requires three GitHub repository secrets:

- **`NEXT_PUBLIC_SUPABASE_URL`**: The Supabase project URL (e.g., `https://your-project.supabase.co`)
  - Used by the API endpoint to connect to the database
  - Must match the URL in your local `.env.local` file

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: The Supabase anonymous/public API key
  - Allows the API endpoint to authenticate with Supabase
  - Must match the anon key in your local `.env.local` file

- **`APP_DOMAIN`**: The production domain name (e.g., `frisconnections.lol`)
  - Used by GitHub Actions to know which URL to call
  - Should not include `https://` prefix

### Manual Trigger

To manually advance the puzzle:

1. Go to GitHub repository → Actions tab
2. Click "Daily Puzzle Advance" workflow
3. Click "Run workflow" button
4. Confirm the run

### Monitoring

Check the GitHub Actions tab to verify:

- Daily runs are executing successfully
- Any errors in the automation process
- Manual trigger functionality

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

### Step 6: Automatic Publishing

Puzzles are automatically published at 12 AM Pacific daily via GitHub Actions. When the queue is empty, the recycling algorithm automatically selects appropriate past puzzles.

## Database Functions

### Core Functions

- **`get_daily_puzzle()`**: Returns the current published puzzle with all categories (validates exactly 1 published puzzle)
- **`assign_daily_puzzle()`**: Uses recycling algorithm via get_next_puzzle(), archives current puzzle, publishes next puzzle, and records presentation
- **`validate_puzzle_composition()`**: Validates puzzle integrity on category assignment
- **`normalize_and_validate_category()`**: Auto-formats and validates category data
- **`auto_assign_queue_position()`**: Auto-assigns queue position when adding puzzles to queue

### Past Puzzles Functions

- **`get_past_puzzles()`**: Returns all puzzles with their last presentation dates, ordered by puzzle number descending
- **`get_puzzle_by_number(puzzle_num)`**: Returns specific puzzle by number with all categories (bypasses RLS for past puzzle access)
- **`get_next_puzzle()`**: 5-tier recycling algorithm for selecting next daily puzzle

## URL Structure

- **Daily puzzle**: `/`
- **Specific puzzle**: `/puzzle/[number]` - Play any past puzzle by number
- **Archive page**: `/past` - Browse all past puzzles with presentation dates
- **How to play**: `/how-to-play` - Game instructions and rules
- **About page**: `/about` - Creator information and collaboration details

## API Endpoints

### Core Game APIs

- **GET /api/daily-puzzle**: Returns current published puzzle
- **POST /api/advance-puzzle**: Advances to next puzzle using recycling algorithm

### Past Puzzles APIs

- **GET /api/past-puzzles**: Returns all puzzles with last presentation dates (uses RPC)
- **GET /api/puzzle/[number]**: Returns specific puzzle by number for replay

## Past Puzzles Feature

### Archive Page (`/past`)

- Browse all historical puzzles with puzzle numbers
- Show last presentation date for each puzzle
- Direct links to replay any past puzzle
- Responsive design for mobile and desktop

### Individual Puzzle Replay (`/puzzle/[number]`)

- Play any past puzzle by its number
- Clear indication that you're playing a past puzzle
- Navigation back to today's puzzle and archive
- Separate localStorage for each puzzle's progress

### Puzzle-Specific Progress Storage

- Each puzzle maintains separate game state in localStorage
- Format: `frisconnections_puzzle_${puzzleNumber}_progress`
- Automatic migration from old single-puzzle storage format
- Preserved user statistics across all puzzles

## Analytics Queries

### Session Completion Analysis

View player completion rates and game outcomes for a specific puzzle:

```sql
-- Session completion analysis for specific puzzle
-- Change the puzzle_id below (1) to analyze different puzzles
WITH session_stats AS (
    SELECT
        session_id,
        attempts_used,
        COALESCE(array_length(solved_categories, 1), 0) as categories_solved_count,
        completed,
        CASE
            WHEN completed = false THEN 'incomplete'
            WHEN completed = true AND COALESCE(array_length(solved_categories, 1), 0) = 4 THEN 'completed_successfully'
            WHEN completed = true AND COALESCE(array_length(solved_categories, 1), 0) < 4 THEN 'failed_too_many_wrong'
        END as session_outcome
    FROM anonymous_sessions
    WHERE puzzle_id = 1
),
outcome_counts AS (
    SELECT
        session_outcome,
        COUNT(*) as count
    FROM session_stats
    GROUP BY session_outcome
),
total_sessions AS (
    SELECT COUNT(*) as total FROM session_stats
)
SELECT
    oc.session_outcome,
    oc.count,
    ROUND((oc.count::decimal / ts.total * 100), 2) as percentage
FROM outcome_counts oc
CROSS JOIN total_sessions ts
ORDER BY oc.count DESC;
```

For all puzzles combined, remove the WHERE clause:

```sql
-- Uncomment this version to get stats across ALL puzzles:
-- FROM anonymous_sessions
-- -- WHERE puzzle_id = 1
```

Results show:

- **incomplete**: Players who haven't finished
- **completed_successfully**: Players who solved all 4 categories
- **failed_too_many_wrong**: Players who used all attempts without winning

### Category Difficulty Analysis

#### Success Rate by Category

```sql
-- Success Rate: All guesses involving each category's items
-- Change puzzle_id = 4 to analyze different puzzles, or remove WHERE clause for all puzzles
WITH category_attempts AS (
    SELECT
        c.id,
        c.name,
        c.difficulty,
        -- Count correct guesses for this category
        (SELECT COUNT(*) FROM anonymous_guesses
         WHERE puzzle_id = 4 AND category_id = c.id AND is_correct = true) as correct_guesses,
        -- Count incorrect guesses that contain any items from this category
        (SELECT COUNT(*) FROM anonymous_guesses
         WHERE puzzle_id = 4 AND is_correct = false AND guessed_items && c.items) as incorrect_guesses
    FROM categories c
    WHERE c.puzzle_id = 4
)
SELECT
    name as category_name,
    difficulty as designed_difficulty,
    correct_guesses,
    incorrect_guesses,
    (correct_guesses + incorrect_guesses) as total_attempts,
    ROUND(
        (correct_guesses::decimal / NULLIF(correct_guesses + incorrect_guesses, 0) * 100), 2
    ) as success_rate_percent
FROM category_attempts
ORDER BY success_rate_percent DESC;
```

## Daily Puzzle System

The puzzle queue operates as an advancing queue with intelligent recycling:

1. Only **one puzzle** has `published = true` at any time (or zero if queue is empty)
2. `assign_daily_puzzle()` function:
   - Uses `get_next_puzzle()` to select next puzzle via recycling algorithm
   - Unpublishes current puzzle (`published = false`)
   - Archives unpublished puzzle (`archived = true`) to prevent re-publishing
   - Publishes selected puzzle and records presentation date
3. `get_daily_puzzle()` returns the single published puzzle
4. If no puzzles are published or multiple puzzles are published, site shows "no puzzle available"
5. Archived puzzles can be recycled after appropriate time intervals
6. Recycled puzzles are automatically re-added to puzzle_queue when selected

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
- Puzzle-specific storage prevents interference between different puzzles
- Statistics tracking: games played, win rate, streaks
- Automatic migration from legacy storage format
- No cloud sync - data tied to specific browser

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account
- GitHub repository
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

5. **Configure GitHub Secrets**
   In your GitHub repository, go to Settings → Secrets and variables → Actions, then add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `APP_DOMAIN`: Your production domain (e.g., `frisconnections.lol`)

6. **Run the development server**
   ```bash
   npm run dev
   ```

Open http://localhost:3000 in your browser. The About page is accessible at http://localhost:3000/about and past puzzles at http://localhost:3000/past.

## Development Commands

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality

- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Check TypeScript types

### Testing

- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report

## Code Quality & Testing

This project uses comprehensive tooling to maintain code quality and reliability:

### Code Quality

- **ESLint**: TypeScript, React, accessibility, and React Hooks rules
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for automatic linting/formatting
- **Pre-commit**: Code and tests must pass before commits

### Testing Framework

- **Vitest**: Fast unit testing with TypeScript support
- **Testing Library**: React component testing with accessibility focus
- **jsdom**: Browser environment simulation for tests
- **Coverage**: Built-in coverage reporting

### Test Structure

```
src/
├── components/
│   └── __tests__/           # Component tests
├── lib/
│   └── __tests__/           # Unit tests for utilities
└── test/
    ├── setup.ts             # Test environment setup
    └── accessibility.ts     # Accessibility testing helpers
```

### Running Tests

For development with live feedback:

```bash
npm run test          # Watch mode - reruns tests when files change
npm run test:ui       # Interactive UI for debugging tests
```

For CI/CD and final validation:

```bash
npm run test:run      # Single run - used in pre-commit hooks
npm run test:coverage # Generate coverage reports
```

### Pre-commit Hooks

Before any commit, the following automatically runs:

1. **ESLint** fixes code style issues
2. **Prettier** formats code consistently
3. **Vitest** runs all tests to ensure functionality

If any step fails, the commit is blocked until fixed.

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
- `archived`: Boolean flag preventing re-publication (can be recycled)

### Puzzle Presentations Table

**Structure Constraints:**

- `puzzle_id`: References puzzles table
- `presented_date`: Date puzzle was shown as daily puzzle
- Unique constraint on (puzzle_id, presented_date)
- Used for recycling algorithm timing decisions

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

**View Presentation History:**

```sql
-- Check recent puzzle presentations
SELECT pp.presented_date, p.puzzle_number,
       STRING_AGG(c.name, ', ' ORDER BY c.difficulty) as categories
FROM puzzle_presentations pp
JOIN puzzles p ON pp.puzzle_id = p.id
LEFT JOIN categories c ON p.id = c.puzzle_id
GROUP BY pp.presented_date, p.puzzle_number
ORDER BY pp.presented_date DESC
LIMIT 10;
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

✅ **Automated Daily Puzzle Assignment**

- GitHub Actions workflow for scheduled puzzle advancement
- API endpoint for puzzle progression with recycling algorithm
- Manual trigger capability for testing and emergency use

✅ **Social Sharing**

- Emoji grid generation showing category difficulty patterns
- Clipboard sharing with puzzle number and website URL
- Share format with difficulty pattern display

✅ **Session Tracking**

- Anonymous guess and session recording in database
- Automatic session creation on puzzle start
- Real-time guess recording and session updates
- Privacy-focused: no personal data, browser-based session IDs only

✅ **User Statistics**

- Real-time stats tracking: games played, wins, streaks
- localStorage persistence for user performance data
- Accurate win percentage and streak calculations
- Stats display in results modal after game completion

✅ **Site Navigation**

- About page with creator information and collaboration contact
- How to play page with game instructions
- Header navigation with clickable site title and page links
- Consistent styling across all pages using CSS custom properties

✅ **Past Puzzles System**

- Archive page showing all historical puzzles with presentation dates
- Individual puzzle replay at `/puzzle/[number]` URLs
- Puzzle-specific localStorage to prevent save state conflicts
- Automatic migration from legacy single-puzzle storage format
- Navigation between daily puzzle, past puzzles, and individual puzzles

✅ **Puzzle Recycling Algorithm**

- 5-tier intelligent recycling when puzzle queue is empty
- Time-based recycling priorities (6 months → 3 months → 1 month → 3 days)
- Automatic presentation tracking in puzzle_presentations table
- Seamless integration with existing queue management system

✅ **SEO and Discoverability**

- Dynamic sitemap generation including all routes
- Open Graph image for social sharing
- Robots.txt for search engine guidance

## Features Not Yet Implemented

🔲 **Admin Interface**: Content management for adding new puzzles
🔲 **Analytics Dashboard**: Visual puzzle difficulty calibration and user metrics
🔲 **Advanced Statistics**: Per-puzzle completion tracking and difficulty analysis UI

## Customization for Other Cities

This codebase is designed to be easily adapted for other cities:

1. **Update branding**: Change app name, title, and description in `layout.tsx`
2. **Create new categories**: Replace SF-specific categories with your city's themes
3. **Modify styling**: Update colors and fonts in `globals.css` and Tailwind config
4. **Add city data**: Populate database with location-specific puzzle content

The game mechanics, past puzzles system, and technical infrastructure remain the same - only the content and branding need customization.

## Technical Decisions

### Why Supabase?

- Real-time capabilities for future features
- Built-in authentication (if needed later)
- Generous free tier suitable for daily puzzle games
- SQL functions for complex puzzle assignment and recycling logic

### Why Next.js App Router?

- Server-side rendering for better SEO
- Built-in API routes for backend functionality
- Modern React patterns with TypeScript support
- Optimized for Vercel deployment
- Dynamic routing for past puzzle URLs

### Why GitHub Actions for Scheduling?

- Free tier includes 2,000 minutes/month (sufficient for daily tasks)
- Version controlled automation
- Easy manual triggering for testing
- No additional service dependencies

### Why Puzzle-Specific Local Storage?

- Allows replay of past puzzles without interference
- No user accounts required (lower barrier to play)
- Instant game state persistence per puzzle
- Privacy-focused (no personal data collection)
- Automatic migration preserves existing user data

### Why RPC Functions for Complex Queries?

- Supabase's JavaScript query builder has limitations with complex joins
- PostgreSQL functions provide full SQL capabilities
- Better performance for complex recycling algorithm queries
- Cleaner API endpoints with single function calls

## Performance Considerations

- Puzzle data cached on server-side
- Minimal bundle size with tree-shaking
- Optimized for mobile devices
- Progressive enhancement (works without JavaScript for basic functionality)
- Dynamic sitemap generation for SEO
- Efficient localStorage usage with puzzle-specific keys

## License

This project is for educational and non-commercial use only. Not affiliated with or endorsed by any existing puzzle games or publications.
