import { NextApiRequest, NextApiResponse } from 'next';

const MIN_TOKEN_BALANCE = 100000;
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { line, publicKey } = req.body;

    if (!line || !publicKey) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // TODO: Implement actual token balance check
    const tokenBalance = await checkTokenBalance(publicKey);
    
    if (tokenBalance < MIN_TOKEN_BALANCE) {
      return res.status(403).json({
        message: `Insufficient token balance. Required: ${MIN_TOKEN_BALANCE}`,
      });
    }

    // TODO: Check last contribution timestamp from database
    const lastContribution = await getLastContribution(publicKey);
    const timeSinceLastContribution = Date.now() - lastContribution;

    if (timeSinceLastContribution < COOLDOWN_PERIOD) {
      const hoursRemaining = Math.ceil(
        (COOLDOWN_PERIOD - timeSinceLastContribution) / (60 * 60 * 1000)
      );
      return res.status(429).json({
        message: `Please wait ${hoursRemaining} hours before submitting another line`,
      });
    }

    // TODO: Save the line to the database
    await saveLine(line, publicKey);

    res.status(200).json({
      message: 'Line submitted successfully',
      line,
    });
  } catch (error) {
    console.error('Error submitting line:', error);
    res.status(500).json({ message: 'Failed to submit line' });
  }
}

// TODO: Replace these mock functions with actual implementations
async function checkTokenBalance(publicKey: string): Promise<number> {
  return 150000; // Mock balance
}

async function getLastContribution(publicKey: string): Promise<number> {
  return Date.now() - (25 * 60 * 60 * 1000); // Mock timestamp (25 hours ago)
}

async function saveLine(line: string, publicKey: string): Promise<void> {
  // Mock implementation
  console.log('Saving line:', line, 'from user:', publicKey);
} 