'use client';

import React from 'react';

interface StoryToolbarProps {
  onViewStory: () => void;
  onSubmitLine: () => void;
  onViewHistory: () => void;
  isConnected: boolean;
}

export default function StoryToolbar({
  onViewStory,
  onSubmitLine,
  onViewHistory,
  isConnected
}: StoryToolbarProps) {
  return (
    <div className="flex gap-4 p-4 bg-gray-900 text-green-500 font-mono rounded-lg">
      <button
        onClick={onViewStory}
        className="px-4 py-2 border border-green-500 hover:bg-green-500 hover:text-black transition-colors"
      >
        view story
      </button>
      <button
        onClick={onSubmitLine}
        disabled={!isConnected}
        className={`px-4 py-2 border border-green-500 hover:bg-green-500 hover:text-black transition-colors ${
          !isConnected ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        submit line
      </button>
      <button
        onClick={onViewHistory}
        className="px-4 py-2 border border-green-500 hover:bg-green-500 hover:text-black transition-colors"
      >
        view history
      </button>
    </div>
  );
} 