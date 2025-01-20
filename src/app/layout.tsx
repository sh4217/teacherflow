import type { Metadata } from "next";
import "./globals.css";
import Logo from "./components/Logo";
import GradientBackground from "./components/GradientBackground";

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
    <html lang="en">
      <body>
        <GradientBackground />
        <nav className="h-20 flex items-center">
          <Logo />
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
