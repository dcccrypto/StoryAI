import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

// Initialize cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

interface AuthRequest {
  publicKey: string;
  signature: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: AuthRequest = await request.json();
    const { publicKey, signature, message } = body;

    if (!publicKey || !signature || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store the message in cache for verification
    cache.set(`auth_${publicKey}`, message);

    // Verify the signature (implement actual verification logic here)
    const isValid = true; // Replace with actual signature verification

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check balance (implement actual balance check here)
    const balance = 150000; // Replace with actual balance check
    const minBalance = 100000;

    if (balance < minBalance) {
      return NextResponse.json(
        { message: `Insufficient balance. Required: ${minBalance} tokens` },
        { status: 403 }
      );
    }

    // Generate session token (implement proper session management)
    const sessionToken = 'dummy-token'; // Replace with actual token generation

    // Create the response with the session cookie
    const response = NextResponse.json(
      { message: 'Authentication successful', balance },
      { status: 200 }
    );

    // Set the session cookie
    response.cookies.set({
      name: 'session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
} 