import { getUserSubscription } from './db';

export async function checkUserSubscription(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const user = await getUserSubscription(userId);
  return user?.subscription_status === 'pro';
}
