'use client';

import React from 'react';

interface UserStats {
  totalLines: number;
  lastContribution: string;
  tokenBalance: number;
  badges: string[];
}

interface UserStatsProps {
  stats: UserStats;
}

export default function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="bg-gray-900 text-green-500 p-4 font-mono rounded-lg">
      <h2 className="text-xl mb-4">User Statistics</h2>
      <div className="space-y-2">
        <p>Total Lines: {stats.totalLines}</p>
        <p>Last Contribution: {stats.lastContribution}</p>
        <p>Token Balance: {stats.tokenBalance.toLocaleString()} tokens</p>
        <div>
          <p className="mb-2">Badges:</p>
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-500 text-black rounded text-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 