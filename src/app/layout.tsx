import type { Metadata } from "next";
import "./globals.css";
import Logo from "./components/Logo";
import GradientBackground from "./components/GradientBackground";
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import SignInButton from "./components/auth/SignInButton";
import UserButton from "./components/auth/UserButton";
import { SubscriptionProvider } from './context/subscription-context';
import SubscribeButton from "./components/payment/SubscribeButton";

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
          <SignedIn>
            <SubscriptionProvider>
              <nav className="h-20 flex items-center justify-between px-4">
                <Logo />
                <div className="flex gap-2 items-center">
                  <SubscribeButton />
                  <UserButton />
                </div>
              </nav>
              <main>
                {children}
              </main>
            </SubscriptionProvider>
          </SignedIn>
          <SignedOut>
            <nav className="h-20 flex items-center justify-between px-4">
              <Logo />
              <div className="flex gap-2 items-center">
                <SignInButton />
              </div>
            </nav>
            <main>
              {children}
            </main>
          </SignedOut>
        </body>
      </html>
    </ClerkProvider>
  );
}
