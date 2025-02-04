import { createPool } from '@vercel/postgres';

export interface User {
  clerk_id: string;
  subscription_status: 'free' | 'pro';
  created_at: Date;
  updated_at: Date;
  stripe_customer_id: string | null;
  subscription_id: string | null;
}

const db = createPool({
  connectionString: process.env.POSTGRES_URL
});

export async function createUsersTable() {
  try {
    await db.sql`
      CREATE TABLE IF NOT EXISTS users (
        clerk_id TEXT PRIMARY KEY,
        subscription_status TEXT NOT NULL DEFAULT 'free',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        stripe_customer_id TEXT UNIQUE,
        subscription_id TEXT UNIQUE
      );
    `;
    console.log('Users table created successfully');
    return new Response(
      JSON.stringify({ message: 'Users table created successfully' }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating users table:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create users table',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

export async function getUserFromTable(clerkId: string) {
  try {
    const { rows } = await db.sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId}
    `;
    return rows[0] as User | undefined;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function createUser(clerkId: string) {
  try {
    await db.sql`
      INSERT INTO users (clerk_id, subscription_status, created_at, updated_at, stripe_customer_id, subscription_id)
      VALUES (${clerkId}, 'free', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL)
      ON CONFLICT (clerk_id) DO NOTHING
    `;
    console.log('User creation handled successfully');
    return new Response(
      JSON.stringify({ message: 'User created successfully' }), 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in user creation: ', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

export async function deleteUser(clerkId: string) {
  try {
    const { rowCount } = await db.sql`
      DELETE FROM users WHERE clerk_id = ${clerkId}
    `;
    if (rowCount === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found' }), 
        { status: 404 }
      );
    }
    console.log('User deleted successfully');
    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user: ', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

export async function updateUser(clerkId: string, newStatus: 'free' | 'pro', stripeCustomerId: string, subscriptionId: string) {
  try {
    const { rowCount } = await db.sql`
      UPDATE users 
      SET subscription_status = ${newStatus},
          updated_at = CURRENT_TIMESTAMP,
          stripe_customer_id = ${stripeCustomerId},
          subscription_id = ${subscriptionId}
      WHERE clerk_id = ${clerkId}
      RETURNING *
    `;
    
    if (rowCount === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found' }), 
        { status: 404 }
      );
    }
    
    console.log('User subscription status updated successfully');
    return new Response(
      JSON.stringify({ message: 'Subscription updated successfully' }), 
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
