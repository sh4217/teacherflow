import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserFromTable } from '@/app/lib/db';
import Stripe from 'stripe';

export async function POST() {
    if (!process.env.STRIPE_SECRET_KEY) {
        return new Response(
          JSON.stringify({ error: 'Stripe secret key is not configured' }), 
          { status: 500 }
        );
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserFromTable(userId);
    if (!user?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}
