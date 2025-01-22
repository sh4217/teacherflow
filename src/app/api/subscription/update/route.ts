import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateUser } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { newStatus } = await request.json();
    if (newStatus !== 'free' && newStatus !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid subscription status' },
        { status: 400 }
      );
    }

    await updateUser(userId, newStatus);
    return NextResponse.json({ subscription_status: newStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
