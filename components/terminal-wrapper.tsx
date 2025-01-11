'use client';

import { useState } from 'react';
import StoryTerminal from './story-terminal';

interface TerminalWrapperProps {
  story: string[];
  isConnected: boolean;
}

export default function TerminalWrapper({ story, isConnected }: TerminalWrapperProps) {
  const [localStory, setLocalStory] = useState(story);

  const handleSubmitLine = async (line: string) => {
    try {
      const response = await fetch('/api/story/submit-line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit line');
      }

      // Update local story after successful submission
      const data = await response.json();
      setLocalStory(data.story);
      
      return true;
    } catch (error) {
      console.error('Error submitting line:', error);
      return false;
    }
  };

  const handleViewHistory = async () => {
    try {
      const response = await fetch('/api/story/history');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      return data.history;
    } catch (error) {
      console.error('Error fetching history:', error);
      return ['Error loading history...'];
    }
  };

  return (
    <StoryTerminal
      story={localStory}
      isConnected={isConnected}
      onSubmitLine={handleSubmitLine}
      onViewHistory={handleViewHistory}
    />
  );
} 