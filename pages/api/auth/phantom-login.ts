import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { signature, publicKey, message } = req.body;

    // TODO: Implement signature verification with Phantom wallet
    // This is a placeholder for the actual implementation
    const isValidSignature = true; // Replace with actual verification

    if (!isValidSignature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // TODO: Create or update user session
    res.status(200).json({
      message: 'Successfully authenticated',
      user: {
        publicKey,
        // Add any additional user data here
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 