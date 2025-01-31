import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserSubscription } from '@/app/lib/subscription';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'developer';
  content: string;
  videoUrl?: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messages }: { messages: ChatMessage[] } = await req.json();

    const isPro = await checkUserSubscription(userId);
    const model = isPro ? 'o3-mini-2025-01-31' : 'o1-mini-2024-09-12';

    const systemPrompt = `You are an expert popularizer creating a text-only script for an educational video. 
      The user is a student asking for an explanation of a complex topic. 
      Your goal is to deliver a clear, precise, yet fun and engaging voiceover script that thoroughly explains the topic. 
      Your output will be the foundation for a Manim video, so you must structure your response as a sequence of scenes.

      Instructions:
      1. Output the script as a series of <scene> and </scene> blocks only—nothing else.
      2. Write the script in a lively, accessible tone while remaining accurate and in-depth.
      3. Speak directly to the student, using relatable examples or analogies where helpful.
      4. Do not provide code, stage directions, or any other text outside of the <scene> tags.
      5. Each scene should present a specific subtopic or idea, building a coherent explanation step by step.

      Remember: ONLY return the voiceover script, enclosed in <scene> ... </scene> tags. 
      Do not include additional comments or formatting beyond that.`;

    let apiMessages: { role: 'user' | 'assistant' | 'system' | 'developer'; content: string }[];
    if (isPro) {
      // For pro users (o3-mini), use developer message
      apiMessages = [{ role: 'developer' as const, content: systemPrompt }, ...messages];
    } else {
      // For free users (o1-mini), convert system message to user message
      apiMessages = [{ role: 'user' as const, content: systemPrompt }, ...messages];
    }

    const response = await openai.chat.completions.create({
      model,
      messages: apiMessages,
      temperature: 1
    });

    const completion = response.choices[0].message.content;
    return NextResponse.json({ message: { role: 'assistant' as const, content: completion } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
