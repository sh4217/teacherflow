'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface SubscriptionContextType {
  isPro: boolean | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({ isPro: null });

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/subscription');
          if (!response.ok) {
            console.error('Subscription check failed:', response.statusText);
            setIsPro(false);
            return;
          }
          const data = await response.json();
          setIsPro(data.isPro);
        } catch (error) {
          console.error('Failed to fetch subscription status:', error);
          setIsPro(false);
        }
      } else {
        setIsPro(false);
      }
    };
    checkSubscription();
  }, [user?.id]);

  return (
    <SubscriptionContext.Provider value={{ isPro }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
} 