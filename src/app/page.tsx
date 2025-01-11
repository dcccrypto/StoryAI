import TerminalWrapper from '@/components/terminal-wrapper';

// Mock initial story data - replace with actual data fetching
async function getInitialStory() {
  return [
    "In a world where stories came alive...",
    "The quantum storytelling engine hummed to life.",
    "Waiting for the next chapter to unfold..."
  ];
}

export default async function Home() {
  const story = await getInitialStory();

  return (
    <main className="min-h-screen h-screen flex flex-col bg-black p-2 sm:p-4 md:p-6">
      {/* Header - takes up minimum space needed */}
      <header className="flex-none mb-2 sm:mb-4">
        <h1 className="text-[#3af23a] text-xl sm:text-2xl md:text-3xl font-mono text-center">
          StoryAI Terminal
        </h1>
        <p className="text-[#3af23a]/70 text-xs sm:text-sm md:text-base font-mono text-center">
          A collaborative storytelling experience
        </p>
      </header>

      {/* Terminal Container - takes up all remaining space */}
      <div className="flex-grow h-0 min-h-0">
        <TerminalWrapper
          story={story}
          isConnected={false}
        />
      </div>

      {/* Footer - takes up minimum space needed */}
      <footer className="flex-none mt-2 sm:mt-4">
        <p className="text-center text-[#3af23a]/50 text-xs font-mono">
          Connect your Phantom wallet to start contributing to the story.
        </p>
      </footer>
    </main>
  );
}
