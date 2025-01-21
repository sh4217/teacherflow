import type { Metadata } from "next";
import "./globals.css";
import Logo from "./components/Logo";
import GradientBackground from "./components/GradientBackground";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import SignInButton from "./components/SignInButton";

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
            <div>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
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
