import type { Metadata } from "next";
import "./globals.css";
import Logo from "./components/Logo";
import GradientBackground from "./components/GradientBackground";
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import SignInButton from "./components/auth/SignInButton";
import UserButton from "./components/auth/UserButton";
import { SubscriptionProvider } from './context/subscription-context';
import SubscriptionButton from "./components/auth/SubscriptionButton";
import StripeButton from "./components/payment/StripeButton";

export const metadata: Metadata = {
  title: "TeacherFlow",
  description: "Beautiful educational videos on any topic",
  icons: {
    icon: '/assets/favicon.ico',
    apple: '/assets/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <GradientBackground />
          <nav className="h-20 flex items-center justify-between px-4">
            <Logo />
            <div className="flex gap-2 items-center">
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <SubscriptionProvider>
                  <StripeButton />
                  <SubscriptionButton />
                  <UserButton />
                </SubscriptionProvider>
              </SignedIn>
            </div>
          </nav>
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
