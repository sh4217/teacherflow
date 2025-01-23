'use client'

import { useState } from 'react';
import { UserButton as ClerkUserButton } from '@clerk/nextjs';
import { useSubscription } from '@/app/context/subscription-context';
import SubscribeButton from '../payment/SubscribeButton';

const SubscriptionIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <rect width="24" height="24" fill="none"/>
      <path d="M12 4v16M4 12h16" stroke="black" strokeWidth="2"/>
    </svg>
  )
}

const SubscriptionTab = () => {
  const [loading, setLoading] = useState(false);
  const { subscription } = useSubscription();

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/customer', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Subscription Status</h2>
      <p className="mb-4">
        You are currently on the <span className="font-medium">{subscription === 'pro' ? 'Pro' : 'Free'}</span> plan
      </p>
      
      {subscription === 'pro' ? (
        <button
          onClick={handleManageSubscription}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Manage Subscription
        </button>
      ) : (
        <SubscribeButton />
      )}
    </div>
  );
}

export default function UserButton() {
  return (
    <ClerkUserButton>
      <ClerkUserButton.UserProfilePage 
        label="Subscription" 
        url="user-profile" 
        labelIcon={<SubscriptionIcon />}
      >
        <SubscriptionTab />
      </ClerkUserButton.UserProfilePage>
    </ClerkUserButton>
  );
}
