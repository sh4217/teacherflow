import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { updateUser } from '@/app/lib/db';
import { sql } from '@vercel/postgres';

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('Starting handleCheckoutSessionCompleted');
    console.log('Session:', JSON.stringify(session, null, 2));
    
    // Get the Clerk user ID from the client_reference_id
    const clerkUserId = session.client_reference_id;
    console.log('Clerk User ID:', clerkUserId);
    
    if (!clerkUserId) {
      console.log('No Clerk user ID found');
      return new Response(
        JSON.stringify({ error: 'No Clerk user ID found in session' }), 
        { status: 400 }
      );
    }

    // Get the customer ID from the session
    const stripeCustomerId = typeof session.customer === 'string'
      ? session.customer 
      : session.customer?.id;
    console.log('Stripe Customer ID:', stripeCustomerId);

    if (!stripeCustomerId) {
      console.log('No Stripe customer ID found');
      return new Response(
        JSON.stringify({ error: 'No Stripe customer ID found in session' }), 
        { status: 400 }
      );
    }

    // Get the subscription ID from the session
    const subscriptionId = session.subscription as string;
    console.log('Subscription ID:', subscriptionId);

    if (!subscriptionId) {
      console.log('No subscription found');
      return new Response(
        JSON.stringify({ error: 'No subscription found in session' }), 
        { status: 400 }
      );
    }

    // Update database with pro subscription status
    console.log('Attempting database update for user: ', clerkUserId);
    return await updateUser(clerkUserId, 'pro', stripeCustomerId, subscriptionId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;

  try {
    const { rowCount } = await sql`
      UPDATE users 
      SET 
        subscription_status = 'free',
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_customer_id = ${stripeCustomerId}
      RETURNING *
    `;

    if (rowCount === 0) {
      console.log('No user found with stripe customer ID:', stripeCustomerId);
      return new Response(
        JSON.stringify({ error: 'User not found' }), 
        { status: 404 }
      );
    }

    console.log('User subscription status updated successfully');
    return new Response(
      JSON.stringify({ message: 'Subscription canceled successfully' }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user subscription: ', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to update subscription status',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Stripe secret key is not configured' }), 
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Stripe webhook secret is not configured' }), 
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No stripe signature found' }), 
        { status: 400 }
      );
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Handle different subscription events
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });

    } catch (err) {
        const error = err as Error;
        console.error('Webhook error:', error.message);
        
        // Stripe signature verification errors are client errors
        if (error.message.includes('signature')) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid webhook signature',
                    message: error.message,
                }),
                { status: 400 }
            );
        }
        
        // Database errors are server errors
        if (error.message.includes('database') || error.message.includes('sql')) {
            return new Response(
                JSON.stringify({
                    error: 'Internal server error',
                    message: 'Database operation failed',
                }),
                { status: 500 }
            );
        }
        
        // Default to 500 for unexpected errors
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
            }),
            { status: 500 }
        );
    }
}
