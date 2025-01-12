import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace with your database client
const mockStory = [
  'Once upon a time in a digital realm...',
  'A group of creative minds gathered to tell a story...',
  'Each contributing their unique perspective...',
];

export async function GET() {
  try {
    // TODO: Replace with actual database query
    const story = mockStory;

    return NextResponse.json({
      story,
      totalLines: story.length,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { message: 'Failed to fetch story' },
      { status: 500 }
    );
  }
} 