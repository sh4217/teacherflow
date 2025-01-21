import { getUserSubscription } from './db';

interface CacheEntry {
  isPro: boolean;
  expiresAt: number;
}

const subscriptionCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function checkUserSubscription(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  
  // Check cache first
  const cached = subscriptionCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.isPro;
  }

  try {
    const user = await getUserSubscription(userId);
    const isPro = user?.subscription_status === 'pro';
    
    // Update cache
    subscriptionCache.set(userId, {
      isPro,
      expiresAt: Date.now() + CACHE_DURATION_MS
    });
    
    return isPro;
  } catch (error) {
    console.error('Error checking user subscription:', error);
    return false;
  }
}
