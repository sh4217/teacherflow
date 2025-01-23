import { createPool } from '@vercel/postgres';

export interface User {
  clerk_id: string;
  subscription_status: 'free' | 'pro';
  created_at: Date;
  updated_at: Date;
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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

export async function getUserSubscription(clerkId: string) {
  try {
    const { rows } = await db.sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId}
    `;
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found' }), 
        { status: 404 }
      );
    }
    return new Response(
      JSON.stringify({ user: rows[0] }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user: ', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch user subscription',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

export async function createUser(clerkId: string) {
  try {
    await db.sql`
      INSERT INTO users (clerk_id, subscription_status)
      VALUES (${clerkId}, 'free')
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

export async function updateUser(clerkId: string, newStatus: 'free' | 'pro') {
  try {
    const { rowCount } = await db.sql`
      UPDATE users 
      SET subscription_status = ${newStatus},
          updated_at = CURRENT_TIMESTAMP
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
