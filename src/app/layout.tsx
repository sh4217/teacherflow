import type { Metadata } from "next";
import "./globals.css";
import Logo from "./components/Logo";

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
        <Logo />
        {children}
      </body>
    </html>
  );
}
