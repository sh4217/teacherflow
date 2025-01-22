import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription } from '@/app/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserSubscription(userId);
    return NextResponse.json({ 
      subscription_status: user?.subscription_status || 'free' 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
