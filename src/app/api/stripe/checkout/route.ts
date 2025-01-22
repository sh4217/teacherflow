import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User must be logged in' }), 
        { status: 401 }
      );
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId,
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    });

    return new Response(
      JSON.stringify({ url: session.url }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: 'Error creating checkout session' }), 
      { status: 500 }
    );
  }
}
