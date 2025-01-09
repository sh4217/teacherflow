import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const systemMessage = {
      role: 'system' as const,
      content: "You are the first phase in a video generation pipeline for educational content. " +
               "The user is a student who will ask you about a topic they want an explanatory video about. " +
               "This video will eventually be created using Manim. " +
               "Output the script for the video that explains the topic in the form of a series of scenes. " +
               "Each scene should be demarcated with a <scene> and a </scene> tag. " +
               "For now, these videos will be text-only. " +
               "Your answer will be given to the next phase of the pipeline, which will convert it into Manim code and render the video. " +
               "Do not respond with anything besides the series of <scene>s. " +
               "Specifically, you are writing the text that the voiceover will be reading, so ONLY respond with the text that they are going to read."
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages: [systemMessage, ...messages],
      temperature: 0,
    });

    const completion = response.choices[0].message.content;
    return NextResponse.json({ role: 'assistant' as const, content: completion });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
