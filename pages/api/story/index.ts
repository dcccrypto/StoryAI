import { NextApiRequest, NextApiResponse } from 'next';

// TODO: Replace with your database client
const mockStory = [
  'Once upon a time in a digital realm...',
  'A group of creative minds gathered to tell a story...',
  'Each contributing their unique perspective...',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // TODO: Replace with actual database query
    const story = mockStory;

    res.status(200).json({
      story,
      totalLines: story.length,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ message: 'Failed to fetch story' });
  }
} 