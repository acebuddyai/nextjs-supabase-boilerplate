import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token = process.env.HUGGING_FACE_API_TOKEN;
    if (!token) {
      throw new Error('Hugging Face API token is not set');
    }

    const { audioBlob } = await request.json();

    if (!audioBlob) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const audioBuffer = Buffer.from(audioBlob, 'base64');

    // Transcribe audio using Whisper model
    const whisperResponse = await fetch('https://api-inference.huggingface.co/models/openai/whisper-small', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: audioBuffer
    });

    const whisperResult = await whisperResponse.json();

    if (!whisperResponse.ok) {
      console.error('Error from Whisper API:', whisperResult);
      return NextResponse.json({ error: whisperResult.error || 'Something went wrong with Whisper' }, { status: 500 });
    }

    const transcribedText = whisperResult.text.trim(); // Ensure the text is trimmed

    // Ensure transcribedText is not empty before sending to Falcon model
    if (!transcribedText) {
      return NextResponse.json({ error: 'Transcription failed, no text to send to Falcon' }, { status: 400 });
    }

    // Send transcribed text to Falcon model
    const falconResponse = await fetch('https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: transcribedText })
    });

    // Log the entire Falcon response to the console
    const falconResult = await falconResponse.json();
    console.log('Falcon API response:', falconResult);

    if (!falconResponse.ok) {
      console.error('Error from Falcon API:', falconResult);
      return NextResponse.json({ error: falconResult.error || 'Something went wrong with Falcon' }, { status: 500 });
    }

    const generatedText = falconResult.generated_text?.trim(); // Ensure the correct field is accessed and trimmed

    if (!generatedText) {
      return NextResponse.json({ error: 'Falcon response is empty' }, { status: 400 });
    }

    return NextResponse.json({ transcribedText, text: generatedText }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/generateText:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}