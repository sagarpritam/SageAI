import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SageAI — Autonomous AI Pentester",
    template: "%s | SageAI"
  },
  description: "Enterprise-grade vulnerability scanning, OSINT intelligence, and AI-powered threat analysis. Run a full pentest in 60 seconds.",
  keywords: ["cybersecurity", "AI security", "pentesting", "vulnerability scanner", "OSINT"],
  authors: [{ name: "SageAI" }],
  openGraph: {
    title: "SageAI — Autonomous AI Pentester",
    description: "Run a full AI-powered pentest on any domain in 60 seconds. Fix vulnerabilities before hackers find them.",
    url: "https://sageai.example.com",
    siteName: "SageAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SageAI Dashboard Preview"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SageAI — Autonomous AI Pentester",
    description: "Run a full AI-powered pentest on any domain in 60 seconds.",
    images: ["/og-image.png"],
  },
};

import { cookies } from "next/headers";
import Link from "next/link";
import { NavNotifications } from "@/components/NavNotifications";
import { MobileNav } from "@/components/MobileNav";
import { CommandPalette } from "@/components/CommandPalette";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sageai_jwt")?.value;
  
  let userEmail = null;
  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userEmail = payload.sub;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {}
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/scan", label: "Scan" },
    { href: "/history", label: "History" },
    { href: "/settings", label: "Settings" },
    { href: "/pricing", label: "Pro" },
  ];

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-emerald-50 min-h-screen flex flex-col`}>
        <header className="px-6 py-3 flex items-center justify-between border-b border-emerald-900/30 z-50 relative backdrop-blur-sm bg-black/80 sticky top-0">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-black text-xl tracking-tighter text-emerald-400 hover:text-emerald-300 transition-colors">SageAI</Link>
            {userEmail && (
              <nav className="hidden sm:flex items-center gap-1">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href}
                    className="text-xs font-mono text-zinc-400 hover:text-emerald-400 px-3 py-1.5 rounded-md hover:bg-emerald-900/20 transition-all">
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            {userEmail ? (
              <>
                <MobileNav links={navLinks} userEmail={userEmail} />
                <NavNotifications />
                <span className="text-xs font-mono text-zinc-500 hidden md:inline">{userEmail}</span>
                <a href="/api/auth/logout" className="text-xs font-mono text-red-400/70 hover:text-red-300 px-3 py-1.5 rounded-md hover:bg-red-900/20 transition-all">
                  Sign Out
                </a>
              </>
            ) : (
              <Link href="/login" className="text-sm font-mono bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-md hover:bg-emerald-600/30 transition border border-emerald-500/30">
                Sign In
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 w-full relative">
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </main>
        {userEmail && (
          <>
            <CommandPalette />
            <OnboardingWizard />
          </>
        )}
      </body>
    </html>
  );
}
