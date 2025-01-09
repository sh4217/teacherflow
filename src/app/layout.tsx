import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
