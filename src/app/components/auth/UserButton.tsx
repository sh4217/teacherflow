'use client'

import { UserButton as ClerkUserButton } from '@clerk/nextjs';
import { useSubscription } from '@/app/context/subscription-context';

const SubscriptionIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <rect width="24" height="24" fill="none"/>
      <path d="M12 4v16M4 12h16" stroke="black" strokeWidth="2"/>
    </svg>
  )
}

const SubscriptionPage = () => {
  const { subscription } = useSubscription();

  return (
    <div>
      <h1>Subscription Status</h1>
      {subscription !== null && (
        <p>{subscription === 'pro' ? 'Pro' : 'Free'}</p>
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
