import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, deleteUser, getUserFromTable } from '@/app/lib/db';

async function handleUserCreated(id: string) {
  try {
    console.log('Creating user with Clerk ID:', id);
    await createUser(id);
    return NextResponse.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

async function handleUserDeleted(id: string) {
  try {
    console.log('Checking for subscription status before deleting user');
    const user = await getUserFromTable(id);
    const subscriptionId = user?.subscription_id;
    if (subscriptionId) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe secret key is not configured');
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      try {
        await stripe.subscriptions.cancel(subscriptionId);
        console.log('Successfully cancelled Stripe subscription');
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError);
      }
    }

    console.log('Deleting user with Clerk ID:', id);
    await deleteUser(id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  const { id } = evt.data;

  if (!id) {
    return NextResponse.json({ error: 'No user ID provided' }, { status: 400 });
  }

  if (eventType === 'user.created') {
    return handleUserCreated(id);
  } else if (eventType === 'user.deleted') {
    return handleUserDeleted(id);
  }

  return NextResponse.json({ message: 'Webhook received' });
}
