import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Replace with actual database query
    const history = mockHistory;
    const total = history.length;
    const totalPages = Math.ceil(total / limit);

    const paginatedHistory = history.slice(
      (page - 1) * limit,
      page * limit
    );

    return NextResponse.json({
      history: paginatedHistory,
      pagination: {
        currentPage: page,
        totalPages,
        totalVersions: total,
      },
    });
  } catch (error) {
    console.error('Error fetching story history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch story history' },
      { status: 500 }
    );
  }
} 