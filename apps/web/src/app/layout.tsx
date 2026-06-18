import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUVARA — Find Your Real, Ready, Right Match",
  description:
    "LUVARA is the premium dating platform where AI enhances compatibility, safety enables vulnerability, and design inspires connection. Meet people who are real, ready, and right for you.",
  keywords: [
    "dating app",
    "premium dating",
    "AI matchmaking",
    "safe dating",
    "meaningful connections",
    "online dating",
  ],
  openGraph: {
    title: "LUVARA — Find Your Real, Ready, Right Match",
    description:
      "The most trusted, intelligent dating platform. AI-enhanced compatibility, safety-first design, and meaningful connections.",
    type: "website",
    siteName: "LUVARA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
