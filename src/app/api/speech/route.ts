import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_RETRIES = 2;
const LAST_ATTEMPT = MAX_RETRIES - 1;
const RETRY_DELAY = 200; // 200 ms delay between retries

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} for speech synthesis`);
          await delay(RETRY_DELAY);
        }

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
        console.error(`Speech synthesis attempt ${attempt + 1} failed:`, error);
        
        // If this was our last retry, throw the error to be handled by the outer catch
        if (attempt === LAST_ATTEMPT) {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Speech synthesis failed after all retries:', error);
    return NextResponse.json(
      { error: 'Speech synthesis failed after all retry attempts' },
      { status: 500 }
    );
  }
}
