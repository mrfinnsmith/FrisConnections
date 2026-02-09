import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen p-6 page-container">
      <div className="max-w-2xl mx-auto pt-20">
        <h1 className="text-3xl font-bold mb-6 page-text">About</h1>
        <div className="rounded-lg shadow-sm p-8 page-content space-y-6">
          <div>
            <p className="mb-4 page-text">
              FrisConnections is a daily word puzzle celebrating San Francisco. Each day features a
              new puzzle with 16 words grouped into 4 categories of SF-themed connections.
            </p>
            <p className="page-text">
              Topics include sports, history facts, Bay Area locations (towns, streets,
              neighborhoods), local restaurants, and people that locals would know. Some categories
              are straightforward, others require a deeper knowledge of the city.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 page-text">How to Play</h2>
            <p className="page-text">
              New to the game?{' '}
              <Link href="/how-to-play" className="font-medium hover:underline page-link">
                Check out the how-to-play guide
              </Link>{' '}
              for rules and strategy tips.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 page-text">Privacy</h2>
            <p className="page-text">
              Your game progress and statistics are stored locally in your browser. No account
              needed, no personal data collected. Your stats stay on your device.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 page-text">Contribute</h2>
            <p className="mb-4 page-text">
              Have an idea for a puzzle? Know some great SF connections that would make a good
              category? Submit your ideas.
            </p>
            <p className="page-text">
              FrisConnections was created by{' '}
              <a href="https://mrfinnsmith.com" className="font-medium hover:underline page-link">
                Finn Smith
              </a>
              . Contact via any of{' '}
              <a
                href="https://mrfinnsmith.com/about"
                className="font-medium hover:underline page-link"
              >
                his online platforms
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
