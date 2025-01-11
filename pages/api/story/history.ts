import { NextApiRequest, NextApiResponse } from 'next';

interface StoryVersion {
  id: string;
  timestamp: string;
  lines: string[];
  contributors: string[];
}

// TODO: Replace with actual database
const mockHistory: StoryVersion[] = [
  {
    id: '1',
    timestamp: '2024-01-01T00:00:00Z',
    lines: ['Once upon a time...'],
    contributors: ['user1'],
  },
  {
    id: '2',
    timestamp: '2024-01-02T00:00:00Z',
    lines: ['Once upon a time...', 'In a digital realm...'],
    contributors: ['user1', 'user2'],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // TODO: Replace with actual database query
    const history = mockHistory;
    const total = history.length;
    const totalPages = Math.ceil(total / limitNum);

    const paginatedHistory = history.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum
    );

    res.status(200).json({
      history: paginatedHistory,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalVersions: total,
      },
    });
  } catch (error) {
    console.error('Error fetching story history:', error);
    res.status(500).json({ message: 'Failed to fetch story history' });
  }
} 