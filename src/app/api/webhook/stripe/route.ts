import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { NextRequest } from 'next/server';

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
    
    try {
      // Update database with pro subscription status
      console.log('Attempting database update for user:', clerkUserId);
      await sql`
        INSERT INTO users (
          clerk_id, 
          subscription_status, 
          created_at, 
          updated_at
        ) 
        VALUES (
          ${clerkUserId}, 
          'pro', 
          NOW(), 
          NOW()
        )
        ON CONFLICT (clerk_id) 
        DO UPDATE SET 
          subscription_status = 'pro',
          updated_at = NOW()
      `;
      console.log('Database update successful');
      return new Response(
        JSON.stringify({ message: 'Subscription updated successfully' }), 
        { status: 200 }
      );
    } catch (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to update subscription status',
            details: error instanceof Error ? error.message : String(error)
          }),
          { status: 500 }
        );
      }
  }

// TO DO: incorporate logic for updating and cancelling subscriptions
// async function handleSubscriptionUpdated(subscription: Stripe.Subscription, stripe: Stripe) {
//   // Get the Clerk user ID from customer metadata
//   const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
//   const clerkUserId = customer.metadata?.clerk_user_id;

//   if (!clerkUserId) {
//     return new Response(
//       JSON.stringify({ error: 'No Clerk user ID found in customer metadata' }), 
//       { status: 400 }
//     );
//   }

//   // Update subscription status in database
//   await sql`
//     UPDATE user_subscriptions 
//     SET 
//       subscription_status = ${subscription.status},
//       updated_at = NOW()
//     WHERE clerk_id = ${clerkUserId}
//   `;
// }

// async function handleSubscriptionDeleted(subscription: Stripe.Subscription, stripe: Stripe) {
//   // Get the Clerk user ID from customer metadata
//   const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
//   const clerkUserId = customer.metadata?.clerk_user_id;

//   if (!clerkUserId) {
//     return new Response(
//       JSON.stringify({ error: 'No Clerk user ID found in customer metadata' }), 
//       { status: 400 }
//     );
//   }

//   // Update subscription status to 'canceled' in database
//   await sql`
//     UPDATE user_subscriptions 
//     SET 
//       subscription_status = 'canceled',
//       updated_at = NOW()
//     WHERE clerk_id = ${clerkUserId}
//   `;
// }

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

    //   case 'customer.subscription.updated': {
    //     await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, stripe);
    //     break;
    //   }

    //   case 'customer.subscription.deleted': {
    //     await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, stripe);
    //     break;
    //   }
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
