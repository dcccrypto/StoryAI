import { NextApiRequest, NextApiResponse } from 'next';

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/';
const MODEL_NAME = 'gpt2'; // Replace with your preferred model

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { story } = req.body;

    if (!process.env.HUGGING_FACE_API_KEY) {
      throw new Error('Hugging Face API key not configured');
    }

    const response = await fetch(`${HUGGING_FACE_API_URL}${MODEL_NAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: story.join('\n'),
        parameters: {
          max_length: 50,
          temperature: 0.7,
          num_return_sequences: 1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate line');
    }

    const data = await response.json();
    const generatedLine = data[0]?.generated_text?.split('\n').pop() || '';

    res.status(200).json({ generatedLine });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ message: 'Failed to generate line' });
  }
} 