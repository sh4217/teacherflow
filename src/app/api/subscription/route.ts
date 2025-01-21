import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserSubscription } from '@/app/lib/subscription';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isPro = await checkUserSubscription(userId);
    return NextResponse.json({ isPro });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
