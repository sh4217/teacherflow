'use client';

import { useState } from 'react';
import { useSubscription } from '@/app/context/subscription-context';

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const { subscription } = useSubscription();
  const isSubscribed = subscription === 'pro';

  const handleSubscribe = async () => {
    if (isSubscribed) return;
    
    try {
      setLoading(true);

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || isSubscribed}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  );
}
