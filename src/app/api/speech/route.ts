import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Convert the raw response to an ArrayBuffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return the audio as a streaming response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Speech synthesis failed' },
      { status: 500 }
    );
  }
}
