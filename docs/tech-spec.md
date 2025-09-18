# Frisconnections - Technical Specification

## 1. Architecture Overview

### Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **State Management**: React built-in (useState, useContext)
- **Analytics**: Supabase Analytics

### Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Main game page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── Game/
│   │   ├── GameBoard.tsx        # Main game component
│   │   ├── TileGrid.tsx         # 4x4 tile grid
│   │   ├── GameControls.tsx     # Submit, shuffle, deselect buttons
│   │   ├── ProgressTracker.tsx  # Solved groups & mistakes counter
│   │   └── CompletionModal.tsx  # End game modal with sharing
│   ├── Sharing/
│   │   ├── ShareButton.tsx      # Main share component
│   │   └── ShareModal.tsx       # Share options modal
│   └── UI/
│       ├── Modal.tsx            # Reusable modal
│       └── Toast.tsx            # Feedback notifications
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── gameLogic.ts             # Game state management
│   ├── localStorage.ts          # Browser storage utilities
│   └── sharing.ts               # Share functionality
└── types/
    └── game.ts                  # TypeScript interfaces
```

## 2. Database Schema & Setup

### Supabase Tables

```sql
-- puzzle_queue table
CREATE TABLE puzzle_queue (
  id SERIAL PRIMARY KEY,
  puzzle_number INTEGER UNIQUE NOT NULL, -- Auto-assigned incrementally
  queue_position INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  scheduled_date DATE,
  published BOOLEAN DEFAULT FALSE
);

-- puzzles table
CREATE TABLE puzzles (
  id SERIAL PRIMARY KEY,
  queue_id INTEGER REFERENCES puzzle_queue(id),
  puzzle_number INTEGER NOT NULL, -- Copy from puzzle_queue
  date DATE UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  published BOOLEAN DEFAULT FALSE
);

-- categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  queue_id INTEGER REFERENCES puzzle_queue(id),
  puzzle_id INTEGER REFERENCES puzzles(id),
  name TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty IN (1, 2, 3, 4)),
  items TEXT[] NOT NULL CHECK (array_length(items, 1) = 4),
  created_at TIMESTAMP DEFAULT NOW()
);

-- anonymous_sessions table
CREATE TABLE anonymous_sessions (
  session_id TEXT PRIMARY KEY,
  puzzle_id INTEGER REFERENCES puzzles(id),
  completed BOOLEAN DEFAULT FALSE,
  attempts_used INTEGER DEFAULT 0 CHECK (attempts_used BETWEEN 0 AND 4),
  solved_categories INTEGER[] DEFAULT '{}',
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP
);

-- anonymous_guesses table
CREATE TABLE anonymous_guesses (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES anonymous_sessions(session_id),
  puzzle_id INTEGER REFERENCES puzzles(id),
  guessed_items TEXT[] NOT NULL CHECK (array_length(guessed_items, 1) = 4),
  item_difficulties INTEGER[] NOT NULL CHECK (array_length(item_difficulties, 1) = 4),
  is_correct BOOLEAN NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  attempt_number INTEGER NOT NULL CHECK (attempt_number BETWEEN 1 AND 4),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_puzzles_date ON puzzles(date);
CREATE INDEX idx_categories_puzzle_id ON categories(puzzle_id);
CREATE INDEX idx_categories_queue_id ON categories(queue_id);
CREATE INDEX idx_anonymous_sessions_puzzle_id ON anonymous_sessions(puzzle_id);
CREATE INDEX idx_anonymous_guesses_session_id ON anonymous_guesses(session_id);
```

### Puzzle Numbering Function

```sql
-- Function to assign next puzzle number when adding to queue
CREATE OR REPLACE FUNCTION get_next_puzzle_number()
RETURNS INTEGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(puzzle_number), 0) + 1 INTO next_number
  FROM puzzle_queue;

  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign puzzle number
CREATE OR REPLACE FUNCTION assign_puzzle_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.puzzle_number IS NULL THEN
    NEW.puzzle_number := get_next_puzzle_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_puzzle_number
  BEFORE INSERT ON puzzle_queue
  FOR EACH ROW
  EXECUTE FUNCTION assign_puzzle_number();
```

### Queue Management Functions

```sql
-- Validate puzzle queue
CREATE OR REPLACE FUNCTION validate_puzzle_queue()
RETURNS TABLE (
  queue_id INTEGER,
  queue_position INTEGER,
  error_type TEXT,
  error_details TEXT
) AS $$
BEGIN
  -- Check for puzzles with wrong number of categories
  RETURN QUERY
  SELECT pq.id, pq.queue_position, 'CATEGORY_COUNT'::TEXT,
         'Expected 4 categories, found ' || COUNT(c.id)::TEXT
  FROM puzzle_queue pq
  LEFT JOIN categories c ON pq.id = c.queue_id
  GROUP BY pq.id, pq.queue_position
  HAVING COUNT(c.id) != 4;

  -- Check for categories with wrong number of items
  RETURN QUERY
  SELECT pq.id, pq.queue_position, 'ITEM_COUNT'::TEXT,
         'Category "' || c.name || '" has ' || array_length(c.items, 1)::TEXT || ' items'
  FROM puzzle_queue pq
  JOIN categories c ON pq.id = c.queue_id
  WHERE array_length(c.items, 1) != 4;

  -- Check for duplicate items within same puzzle
  RETURN QUERY
  SELECT pq.id, pq.queue_position, 'DUPLICATE_ITEMS'::TEXT,
         'Item "' || item || '" appears in multiple categories'
  FROM (
    SELECT pq.id, pq.queue_position, unnest(c1.items) as item
    FROM puzzle_queue pq
    JOIN categories c1 ON pq.id = c1.queue_id
    JOIN categories c2 ON pq.id = c2.queue_id
    WHERE c1.id < c2.id AND c1.items && c2.items
  ) duplicates;

  -- Check for repeated category names from recently published puzzles
  RETURN QUERY
  SELECT pq.id, pq.queue_position, 'REPEATED_CATEGORY'::TEXT,
         'Category "' || c.name || '" was used in recent puzzle'
  FROM puzzle_queue pq
  JOIN categories c ON pq.id = c.queue_id
  WHERE c.name IN (
    SELECT cat.name
    FROM puzzle_queue pub_queue
    JOIN categories cat ON pub_queue.id = cat.queue_id
    WHERE pub_queue.published = TRUE
      AND pub_queue.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql;

-- Daily puzzle assignment function
CREATE OR REPLACE FUNCTION assign_daily_puzzle()
RETURNS TEXT AS $$
DECLARE
  next_queue_item RECORD;
  new_puzzle_id INTEGER;
BEGIN
  -- Get next item from queue
  SELECT * INTO next_queue_item
  FROM puzzle_queue
  WHERE scheduled_date IS NULL
    AND published = FALSE
  ORDER BY queue_position ASC
  LIMIT 1;

  IF next_queue_item IS NULL THEN
    RETURN 'ERROR: No puzzles available in queue';
  END IF;

  -- Validate the queue item
  IF EXISTS (
    SELECT 1 FROM validate_puzzle_queue()
    WHERE queue_id = next_queue_item.id
  ) THEN
    RETURN 'ERROR: Puzzle validation failed for queue position ' || next_queue_item.queue_position;
  END IF;

  -- Create puzzle for tomorrow
  INSERT INTO puzzles (queue_id, puzzle_number, date, published)
  VALUES (next_queue_item.id, next_queue_item.puzzle_number, CURRENT_DATE + INTERVAL '1 day', TRUE)
  RETURNING id INTO new_puzzle_id;

  -- Update queue item
  UPDATE puzzle_queue
  SET scheduled_date = CURRENT_DATE + INTERVAL '1 day',
      published = TRUE
  WHERE id = next_queue_item.id;

  -- Update categories to reference the new puzzle
  UPDATE categories
  SET puzzle_id = new_puzzle_id
  WHERE queue_id = next_queue_item.id;

  RETURN 'SUCCESS: Assigned puzzle ' || new_puzzle_id || ' for ' || (CURRENT_DATE + INTERVAL '1 day');
END;
$$ LANGUAGE plpgsql;

-- Function to reorder queue items
CREATE OR REPLACE FUNCTION reorder_queue_item(item_id INTEGER, new_position INTEGER)
RETURNS TEXT AS $$
DECLARE
  old_position INTEGER;
BEGIN
  -- Get current position
  SELECT queue_position INTO old_position
  FROM puzzle_queue
  WHERE id = item_id AND published = FALSE;

  IF old_position IS NULL THEN
    RETURN 'ERROR: Item not found or already published';
  END IF;

  -- Update positions
  IF new_position > old_position THEN
    -- Moving down: shift items up
    UPDATE puzzle_queue
    SET queue_position = queue_position - 1
    WHERE queue_position > old_position
      AND queue_position <= new_position
      AND published = FALSE;
  ELSE
    -- Moving up: shift items down
    UPDATE puzzle_queue
    SET queue_position = queue_position + 1
    WHERE queue_position >= new_position
      AND queue_position < old_position
      AND published = FALSE;
  END IF;

  -- Set new position
  UPDATE puzzle_queue
  SET queue_position = new_position
  WHERE id = item_id;

  RETURN 'SUCCESS: Moved item to position ' || new_position;
END;
$$ LANGUAGE plpgsql;
```

## 3. Daily Puzzle Assignment System

### Supabase Edge Function

Create `supabase/functions/daily-puzzle-assignment/index.ts`:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const adminEmail = Deno.env.get('ADMIN_EMAIL')!

Deno.serve(async req => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Check if tomorrow's puzzle already exists
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data: existingPuzzle } = await supabase
      .from('puzzles')
      .select('id')
      .eq('date', tomorrowStr)
      .single()

    if (existingPuzzle) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Puzzle already assigned for tomorrow',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Assign next puzzle from queue
    const { data: result, error } = await supabase.rpc('assign_daily_puzzle')

    if (error) throw error

    if (result.startsWith('ERROR')) {
      // Send alert email
      await sendAlertEmail(result)

      return new Response(
        JSON.stringify({
          success: false,
          error: result,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: result,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    await sendAlertEmail(`Daily puzzle assignment failed: ${error.message}`)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

async function sendAlertEmail(message: string) {
  // Use a service like Resend, SendGrid, or similar
  // This is a placeholder - implement with your preferred email service
  console.error('ADMIN ALERT:', message)
}
```

### Cron Job Setup

Add to `supabase/functions/_shared/cron.sql`:

```sql
-- Schedule daily puzzle assignment for 12:01 AM PST
SELECT cron.schedule(
  'daily-puzzle-assignment',
  '1 8 * * *', -- 8:01 AM UTC = 12:01 AM PST
  'SELECT net.http_post(
    ''https://your-project.supabase.co/functions/v1/daily-puzzle-assignment'',
    ''{"trigger": "cron"}'',
    ''{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}''
  );'
);
```

## 4. Frontend Implementation

### Game State Management

`src/lib/gameLogic.ts`:

```typescript
export interface GameState {
  puzzle: Puzzle | null
  selectedTiles: string[]
  solvedGroups: SolvedGroup[]
  attemptsUsed: number
  gameStatus: 'playing' | 'won' | 'lost'
  guessHistory: GuessResult[]
}

export interface Puzzle {
  id: number
  date: string
  puzzle_number: number
  categories: Category[]
}

export interface Category {
  id: number
  name: string
  difficulty: 1 | 2 | 3 | 4
  items: string[]
}

export interface SolvedGroup {
  category: Category
  solvedAt: number
}

export interface GuessResult {
  items: string[]
  isCorrect: boolean
  category?: Category
  attemptNumber: number
  itemDifficulties: number[]
}

export const DIFFICULTY_COLORS = {
  1: '#f59e0b', // Yellow
  2: '#10b981', // Green
  3: '#3b82f6', // Blue
  4: '#8b5cf6', // Purple
}

export const DIFFICULTY_EMOJI = {
  1: '🟨', // Yellow
  2: '🟩', // Green
  3: '🟦', // Blue
  4: '🟪', // Purple
}
```

### Utility Functions

`src/lib/utils.ts`:

```typescript
import { v4 as uuidv4 } from 'uuid'

export function getOrCreateSessionId(): string {
  const key = 'frisconnections-session-id'
  let sessionId = localStorage.getItem(key)

  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem(key, sessionId)
  }

  return sessionId
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

### Sharing Implementation

`src/lib/sharing.ts`:

```typescript
export function generateShareText(
  puzzleNumber: number,
  gameState: GameState,
  date: string
): string {
  const { guessHistory, gameStatus, puzzle } = gameState

  // Count mistakes (incorrect guesses)
  const mistakes = guessHistory.filter(guess => !guess.isCorrect).length
  const header = `Frisconnections #${puzzleNumber} ${mistakes}/4`

  // Generate emoji grid - one line per guess in chronological order
  const emojiLines = guessHistory.map(guess => {
    if (guess.isCorrect && guess.category) {
      // Correct guess: show 4 emoji of the category's difficulty color
      return DIFFICULTY_EMOJI[guess.category.difficulty].repeat(4)
    } else {
      // Incorrect guess: show the actual categories of the guessed items
      return guess.itemDifficulties.map(difficulty => DIFFICULTY_EMOJI[difficulty]).join('')
    }
  })

  const grid = emojiLines.join('\n')
  const url = 'https://frisconnections.vercel.app'

  return `${header}\n\n${grid}\n\n${url}`
}

export async function shareResults(shareText: string): Promise<boolean> {
  // Try native share first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Frisconnections',
        text: shareText,
      })
      return true
    } catch (error) {
      if (error.name === 'AbortError') {
        return false // User cancelled
      }
      // Fall through to clipboard
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareText)
    return true
  } catch (error) {
    // Final fallback - create temporary textarea
    const textarea = document.createElement('textarea')
    textarea.value = shareText
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  }
}
```

### Local Storage & Progress Tracking

`src/lib/localStorage.ts`:

```typescript
interface GameProgress {
  sessionId: string
  puzzleId: number
  selectedTiles: string[]
  solvedGroups: number[]
  attemptsUsed: number
  gameStatus: 'playing' | 'won' | 'lost'
  guessHistory: GuessResult[]
}

interface UserStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  lastPlayedDate: string
}

export function saveGameProgress(puzzleId: number, gameState: Partial<GameState>) {
  const progress = {
    puzzleId,
    selectedTiles: gameState.selectedTiles || [],
    solvedGroups: gameState.solvedGroups?.map(sg => sg.category.id) || [],
    attemptsUsed: gameState.attemptsUsed || 0,
    gameStatus: gameState.gameStatus || 'playing',
    guessHistory: gameState.guessHistory || [],
    timestamp: Date.now(),
  }

  localStorage.setItem('frisconnections-progress', JSON.stringify(progress))
}

export function loadGameProgress(puzzleId: number): Partial<GameState> | null {
  const saved = localStorage.getItem('frisconnections-progress')
  if (!saved) return null

  try {
    const progress = JSON.parse(saved)
    if (progress.puzzleId !== puzzleId) return null

    // Check if progress is from today (don't restore old games)
    const isToday = new Date(progress.timestamp).toDateString() === new Date().toDateString()
    if (!isToday) return null

    return {
      selectedTiles: progress.selectedTiles,
      attemptsUsed: progress.attemptsUsed,
      gameStatus: progress.gameStatus,
      guessHistory: progress.guessHistory,
      // Note: solvedGroups will be reconstructed from guessHistory
    }
  } catch {
    return null
  }
}

export function updateUserStats(won: boolean, date: string) {
  const stats = getUserStats()
  const today = new Date().toISOString().split('T')[0]

  stats.gamesPlayed++

  if (won) {
    stats.gamesWon++

    // Update streak
    if (stats.lastPlayedDate === getPreviousDate(today)) {
      stats.currentStreak++
    } else {
      stats.currentStreak = 1
    }

    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
  } else {
    stats.currentStreak = 0
  }

  stats.lastPlayedDate = today
  localStorage.setItem('frisconnections-stats', JSON.stringify(stats))
}

function getUserStats(): UserStats {
  const saved = localStorage.getItem('frisconnections-stats')
  if (!saved) {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: '',
    }
  }

  try {
    return JSON.parse(saved)
  } catch {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: '',
    }
  }
}

function getPreviousDate(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}
```

## 5. Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin alerts
ADMIN_EMAIL=your-email@example.com

# For edge functions
RESEND_API_KEY=your-resend-api-key
```

## 6. Deployment Configuration

### Vercel Configuration

`vercel.json`:

```json
{
  "functions": {
    "app/api/manual-assignment/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "ADMIN_EMAIL": "@admin-email"
  }
}
```

### Manual Trigger API Route

`src/app/api/manual-assignment/route.ts`:

```typescript
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    const { data: result, error } = await supabase.rpc('assign_daily_puzzle')

    if (error) throw error

    return NextResponse.json({ success: true, message: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

## 7. Analytics & Difficulty Tracking

### Key Metrics

- **Category difficulty**: Track solve rates per category to calibrate difficulty
- **Common mistakes**: Identify which items are frequently grouped incorrectly
- **Puzzle balance**: Monitor if puzzles are too easy/hard overall

### Difficulty Calibration Queries

```sql
-- Category solve rate (should be ~80% Yellow, ~60% Green, ~40% Blue, ~20% Purple)
SELECT c.name, c.difficulty,
       COUNT(CASE WHEN ag.is_correct THEN 1 END) * 100.0 / COUNT(*) as solve_rate
FROM categories c
LEFT JOIN anonymous_guesses ag ON c.id = ag.category_id
GROUP BY c.id, c.name, c.difficulty
ORDER BY c.difficulty, solve_rate DESC;

-- Most confused item pairs (frequently guessed together incorrectly)
SELECT unnest(guessed_items) as item, COUNT(*) as incorrect_groupings
FROM anonymous_guesses
WHERE is_correct = FALSE
GROUP BY item
ORDER BY incorrect_groupings DESC;

-- Daily completion rates
SELECT
  p.date,
  COUNT(DISTINCT as_session.session_id) as players,
  COUNT(DISTINCT CASE WHEN as_session.completed THEN as_session.session_id END) as completions,
  COUNT(DISTINCT CASE WHEN as_session.completed THEN as_session.session_id END) * 100.0 /
    COUNT(DISTINCT as_session.session_id) as completion_rate
FROM puzzles p
LEFT JOIN anonymous_sessions as_session ON p.id = as_session.puzzle_id
GROUP BY p.date
ORDER BY p.date DESC;
```

## 8. Content Management System

### Daily Puzzle Queue System

- **FIFO Queue**: Puzzles stored in `puzzle_queue` table with `queue_position`
- **Auto-assignment**: System automatically assigns next queued puzzle to current date
- **Manual scheduling**: Admin can pre-assign specific dates to queue items
- **Future planning**: Build up queue of puzzles weeks/months in advance

### Queue Validation Function

```sql
-- Validate entire puzzle queue for errors
CREATE OR REPLACE FUNCTION validate_puzzle_queue()
RETURNS TABLE (
  queue_id INTEGER,
  queue_position INTEGER,
  error_type TEXT,
  error_details TEXT
) AS $
BEGIN
  -- Check for puzzles with wrong number of categories
  RETURN QUERY
  SELECT pq.id, pq.queue_position, 'CATEGORY_COUNT'::TEXT,
         'Expected 4 categories, found ' || COUNT(c.id)::TEXT
  FROM puzzle_queue pq
  LEFT JOIN categories c ON pq.id = c.queue_id
  GROUP BY pq.id, pq.queue_position
  HAVING COUNT(c.id) != 4;

  -- Check for categories with wrong number of items
  RETURN QUERY
  SELECT pq.id, pq.queue_position, 'ITEM_COUNT'::TEXT,
         'Category "' || c.name || '" has ' || array_length(c.items, 1)::TEXT || ' items'
  FROM puzzle_queue pq
  JOIN categories c ON pq.id = c.queue_id
  WHERE array_length(c.items, 1) != 4;

  -- Check for duplicate items within same puzzle
  RETURN QUERY
  SELECT pq.id, pq.queue_position, 'DUPLICATE_ITEMS'::TEXT,
         'Item "' || item || '" appears in multiple categories'
  FROM (
    SELECT pq.id, pq.queue_position, unnest(c1.items) as item
    FROM puzzle_queue pq
    JOIN categories c1 ON pq.id = c1.queue_id
    JOIN categories c2 ON pq.id = c2.queue_id
    WHERE c1.id < c2.id AND c1.items && c2.items
  ) duplicates;

  -- Check for repeated category names from recent puzzles
  RETURN QUERY
  SELECT pq.id, pq.queue_position, 'REPEATED_CATEGORY'::TEXT,
         'Category "' || c.name || '" was used in recent puzzle'
  FROM puzzle_queue pq
  JOIN categories c ON pq.id = c.queue_id
  WHERE c.name IN (
    SELECT cat.name
    FROM puzzle_queue pub_queue
    JOIN categories cat ON pub_queue.id = cat.queue_id
    WHERE pub_queue.published = TRUE
      AND pub_queue.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
  );
END;
$ LANGUAGE plpgsql;
```

### Queue Management

- **Add to queue**: Insert new puzzle at end of queue
- **Reorder queue**: Update `queue_position` values to change order
- **Validate before publish**: Run validation function daily before assignment
- **Error alerts**: Admin notification system for validation failures

### Error Handling

#### Network Errors

- **Offline mode**: Cache today's puzzle, allow play without connection
- **Retry logic**: Auto-retry failed requests with exponential backoff
- **Graceful degradation**: Game works, analytics fail silently

#### Data Integrity Errors

- **Malformed puzzle data**: Alert admin, show "puzzle unavailable today" to users
- **Missing puzzle for date**: Alert admin, show "puzzle unavailable today" to users
- **Invalid date requests**: Show "puzzle unavailable" message to users

#### Content Validation

- **Queue validation function**: Check entire queue for duplicate items, repeated categories, wrong counts
- **Daily validation**: Automatic check before assigning next puzzle from queue
- **30-day category cooldown**: Prevent repeating category names within 30 days
- **Admin alerts**: Notification system for validation failures before publish

#### Game State Errors

- **Corrupted localStorage**: Reset to fresh state, don't crash
- **Puzzle completion conflicts**: Trust browser state over server discrepancies

## 9. Development Commands

```bash
# Setup
npm install
npm run dev

# Database setup
npx supabase start
npx supabase db reset

# Deploy edge functions
npx supabase functions deploy daily-puzzle-assignment

# Manual puzzle assignment
curl -X POST http://localhost:3000/api/manual-assignment
```
