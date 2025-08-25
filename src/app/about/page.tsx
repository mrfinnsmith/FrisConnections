export default function About() {
    return (
        <div className="min-h-screen p-6 page-container">
            <div className="max-w-2xl mx-auto pt-20">
                <h1 className="text-3xl font-bold mb-6 page-text">About</h1>
                <div className="rounded-lg shadow-sm p-8 page-content">
                    <p className="mb-4 page-text">
                        FrisConnections was created with love for San Francisco by{' '}
                        <a
                            href="https://mrfinnsmith.com"
                            className="font-medium hover:underline page-link"
                        >
                            Finn Smith
                        </a>.
                    </p>
                    <p className="page-text">
                        Want to collaborate on puzzles or have suggestions? Reach out via any of{' '}
                        <a
                            href="https://mrfinnsmith.com/about"
                            className="font-medium hover:underline page-link"
                        >
                            my online platforms
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    );
}