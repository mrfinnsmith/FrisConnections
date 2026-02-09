import Link from 'next/link'

export default function HowToPlay() {
  return (
    <div className="min-h-screen p-6 page-container">
      <div className="max-w-2xl mx-auto pt-20">
        <h1 className="text-3xl font-bold mb-6 page-text">How to Play</h1>
        <div className="rounded-lg shadow-sm p-8 page-content space-y-6 page-text">
          <section>
            <h3 className="text-lg font-semibold mb-3">The Goal</h3>
            <p>Find four groups of four words that share something in common.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">How to Play</h3>
            <div className="space-y-2">
              <p>
                <strong>Select words:</strong> Click up to 4 words that you think belong together
              </p>
              <p>
                <strong>Deselect:</strong> Click "Deselect All" or click selected words to unselect
                them
              </p>
              <p>
                <strong>Shuffle:</strong> Click "Shuffle" to rearrange the grid for a fresh
                perspective
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Difficulty Levels</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="difficulty-indicator" style={{ backgroundColor: '#F9DF6F' }}></div>
                <span>
                  <strong>Easy:</strong> You might as well be a Dodgers fan
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="difficulty-indicator" style={{ backgroundColor: '#A0C35A' }}></div>
                <span>
                  <strong>Medium:</strong> You can rank at least 5 taquerias.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="difficulty-indicator" style={{ backgroundColor: '#B0C4EF' }}></div>
                <span>
                  <strong>Hard:</strong> You are a cable car grip.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="difficulty-indicator" style={{ backgroundColor: '#BA81C5' }}></div>
                <span>
                  <strong>Expert:</strong> You are Herb Caen reincarnated. The Golden Gate Fortune
                  Cookie Factory asks <em>you</em> for fortunes. Your veins are filled with fog.
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">San Francisco Theme</h3>
            <p>Every puzzle celebrates San Francisco with categories like:</p>
            <div className="ml-4 mt-2 space-y-1">
              <p>• SF neighborhoods and landmarks</p>
              <p>• Local food and restaurants</p>
              <p>• Bay Area history and culture</p>
              <p>• Tech companies</p>
              <p>• Transportation and geography</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Tips for Success</h3>
            <div className="space-y-2">
              <p>
                <strong>Start with what you know:</strong> Look for obvious connections first
              </p>
              <p>
                <strong>Think locally:</strong> Consider SF-specific meanings and references
              </p>
              <p>
                <strong>Watch for red herrings:</strong> Some words might seem to fit multiple
                groups
              </p>
              <p>
                <strong>Use your attempts wisely:</strong> You only get 4 wrong guesses
              </p>
              <p>
                <strong>Consider wordplay:</strong> Purple categories often involve puns or double
                meanings
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Winning</h3>
            <p>
              Solve all four groups to win! Your progress saves automatically, and you can share
              your results with an emoji pattern that shows which difficulty levels you solved.
            </p>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg">
            <p>
              Ready to play?{' '}
              <Link href="/" className="font-medium hover:underline text-sf-navy">
                Try today's puzzle
              </Link>{' '}
              or browse the{' '}
              <Link href="/past" className="font-medium hover:underline text-sf-navy">
                past puzzles archive
              </Link>
              . Learn more{' '}
              <Link href="/about" className="font-medium hover:underline text-sf-navy">
                about FrisConnections
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
