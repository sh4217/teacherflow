import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserSubscription } from '@/app/lib/subscription';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
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
    
    // Check user's subscription status using shared utility
    const isPro = await checkUserSubscription(userId);
    const model = isPro ? 'o1-mini-2024-09-12' : 'gpt-4o-2024-11-20';

    const systemPrompt = `You are the first phase in a video generation pipeline for educational content.
        The user is a student who will ask you about a topic they want an explanatory video about.
        This video will eventually be created using Manim.
        Output the script for the video that explains the topic in the form of a series of scenes.
        Each scene should be demarcated with a <scene> and a </scene> tag.
        For now, these videos will be text-only.
        Your answer will be given to the next phase of the pipeline, which will convert it into Manim code and render the video.
        Do not respond with anything besides the series of <scene>s.
        Specifically, you are writing the text that the voiceover will be reading, so ONLY respond with the text that they are going to read.`;

    let apiMessages: { role: 'user' | 'assistant' | 'system'; content: string }[];
    if (isPro) {
      // For pro users (o1-Mini), convert system message to user message
      apiMessages = [{ role: 'user' as const, content: systemPrompt }, ...messages];
    } else {
      // For free users (gpt-4o), use system message
      apiMessages = [{ role: 'system' as const, content: systemPrompt }, ...messages];
    }

    const response = await openai.chat.completions.create({
      model,
      messages: apiMessages,
      temperature: isPro ? 1 : 0,
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
