import { getUserSubscription } from './db';

export enum SubscriptionStatus {
  Free = 'free',
  Pro = 'pro'
}

export async function checkUserSubscription(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const user = await getUserSubscription(userId);
    return user?.subscription_status === SubscriptionStatus.Pro;
  } catch (error) {
    console.error('Error checking user subscription:', error);
    return false;
  }
}
