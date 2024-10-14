import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  console.log('Received query:', query); // Log the received query for debugging

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct', // Updated to Falcon-7B model
      {
        inputs: query,
        parameters: { max_new_tokens: 500 }, // Adjust this value as needed
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_TOKEN}`, // Use the environment variable
        },
      }
    );
    console.log('API Response:', response.data); // Log the API response for debugging
    return NextResponse.json({ response: response.data });
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    return NextResponse.json({ response: 'Error calling AI API' }, { status: 500 });
  }
}

