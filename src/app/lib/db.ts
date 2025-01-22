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
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
}

export async function getUserSubscription(clerkId: string) {
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
      INSERT INTO users (clerk_id, subscription_status)
      VALUES (${clerkId}, 'free')
      ON CONFLICT (clerk_id) DO NOTHING
    `;
    console.log('User creation handled successfully');
  } catch (error) {
    console.error('Error in user creation:', error);
    throw error;
  }
}

export async function deleteUser(clerkId: string) {
  try {
    const { rowCount } = await db.sql`
      DELETE FROM users WHERE clerk_id = ${clerkId}
    `;
    if (rowCount === 0) {
      throw new Error('User not found');
    }
    console.log('User deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
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
      throw new Error('User not found');
    }
    
    console.log('User subscription status updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}
