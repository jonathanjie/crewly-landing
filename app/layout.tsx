import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Crewly — AI Crew for Your Business",
  description:
    "Deploy AI agents that join your team on WhatsApp, Telegram, Slack, and more. Tell us what you need — we build and deploy your crew.",
  openGraph: {
    title: "Crewly — AI Crew for Your Business",
    description:
      "Deploy AI agents that join your team on WhatsApp, Telegram, Slack, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} antialiased grain`}
      >
        {children}
      </body>
    </html>
  );
}
