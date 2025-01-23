'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface SubscriptionContextType {
  subscription: 'free' | 'pro' | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: true,
  refreshSubscription: async () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [subscription, setSubscription] = useState<'free' | 'pro' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Immediately clear subscription when user signs out
  useEffect(() => {
    if (isUserLoaded && !isSignedIn) {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [isUserLoaded, isSignedIn]);

  const checkSubscription = async () => {
    if (!isUserLoaded) return;
    
    setIsLoading(true);
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
    setIsLoading(false);
  };

  useEffect(() => {
    if (isSignedIn) {
      checkSubscription();
    }
  }, [user?.id, isUserLoaded, isSignedIn]);

  return (
    <SubscriptionContext.Provider value={{ 
      subscription, 
      isLoading,
      refreshSubscription: checkSubscription 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
