'use client'

import { UserButton as ClerkUserButton, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

const SubscriptionIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <rect width="24" height="24" fill="none"/>
      <path d="M12 4v16M4 12h16" stroke="black" strokeWidth="2"/>
    </svg>
  )
}

const SubscriptionPage = () => {
  const { user } = useUser();
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkSubscription = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/subscription');
          if (!response.ok) {
            console.error('Subscription check failed:', response.statusText);
            if (isMounted) setIsPro(false);
            return;
          }
          const data = await response.json();
          if (isMounted) {
            setIsPro(data.isPro);
          }
        } catch (error) {
          console.error('Failed to fetch subscription status:', error);
          if (isMounted) setIsPro(false);
        }
      } else {
        if (isMounted) setIsPro(false);
      }
    };
    checkSubscription();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <div>
      <h1>Subscription Status</h1>
      {isPro !== null && (
        <p>{isPro ? 'Pro' : 'Free'}</p>
      )}
    </div>
  )
}

export default function UserButton() {
  return (
    <ClerkUserButton>
      <ClerkUserButton.UserProfilePage 
        label="Subscription" 
        url="user-profile" 
        labelIcon={<SubscriptionIcon />}
      >
        <SubscriptionPage />
      </ClerkUserButton.UserProfilePage>
    </ClerkUserButton>
  );
}
