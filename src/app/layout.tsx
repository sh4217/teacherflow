import type { Metadata } from "next";
import "./globals.css";
import Logo from "./components/Logo";
import { Dancing_Script } from "next/font/google";
import GradientBackground from "./components/GradientBackground";

const dancingScript = Dancing_Script({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "TeacherFlow",
  description: "Automatic explanatory videos on any topic",
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
