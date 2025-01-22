'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface SubscriptionContextType {
  subscription: 'free' | 'pro' | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  refreshSubscription: async () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<'free' | 'pro' | null>(null);

  const checkSubscription = async () => {
    if (user?.id) {
      try {
        const response = await fetch('/api/subscription');
        if (!response.ok) {
          console.error('Subscription check failed:', response.statusText);
          setSubscription('free');
          return;
        }
        const data = await response.json();
        setSubscription(data.subscription_status);
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
        setSubscription('free');
      }
    } else {
      setSubscription('free');
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user?.id]);

  return (
    <SubscriptionContext.Provider value={{ 
      subscription, 
      refreshSubscription: checkSubscription 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
} 