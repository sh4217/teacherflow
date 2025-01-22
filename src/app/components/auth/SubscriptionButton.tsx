'use client';

import { useSubscription } from '@/app/context/subscription-context';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function SubscriptionButton() {
  const { user } = useUser();
  const { subscription, refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSubscription = async () => {
    if (!user?.id || isLoading) return;
    
    setIsLoading(true);
    try {
      const newStatus = subscription === 'free' ? 'pro' : 'free';
      const response = await fetch('/api/subscription/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      await refreshSubscription();
    } catch (error) {
      console.error('Error toggling subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSubscription}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        subscription === 'free'
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-red-500 hover:bg-red-600 text-white'
      }`}
    >
      {isLoading ? 'Loading...' : subscription === 'free' ? 'Subscribe' : 'Unsubscribe'}
    </button>
  );
}
