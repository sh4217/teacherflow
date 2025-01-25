import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { getUserFromTable } from '@/app/lib/db';

export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Stripe secret key is not configured' }), 
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return new Response(
        JSON.stringify({ error: 'Stripe price ID is not configured' }), 
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User must be logged in' }), 
        { status: 401 }
      );
    }

    // Get user data to check for existing Stripe customer ID
    const user = await getUserFromTable(userId);

    // Create session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
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
      payment_method_types: ['card']
    };

    // If user has an existing Stripe customer ID, include it
    if (user?.stripe_customer_id) {
      sessionConfig.customer = user.stripe_customer_id;
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

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
