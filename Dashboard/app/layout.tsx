import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnIsphere — Learning intelligence",
  description: "A premium learning management system for modern institutes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
