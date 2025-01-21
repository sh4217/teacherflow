import { SignInButton as ClerkSignInButton } from '@clerk/nextjs';

export default function SignInButton() {
  return (
    <div className="bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
      <ClerkSignInButton>
        <button className="px-4 py-2 text-white font-medium">
          Sign In
        </button>
      </ClerkSignInButton>
    </div>
  );
} 