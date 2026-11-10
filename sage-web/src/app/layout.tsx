import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  PLATFORM_CAPABILITIES_COUNT,
  PLATFORM_DASHBOARD_MODULES_COUNT,
  PLATFORM_VERSION,
  PLATFORM_WAVES_RANGE,
  SITE_URL,
} from "@/lib/platform";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SageAI — Autonomous AI Pentester",
    template: "%s | SageAI"
  },
  description: `SageAI v${PLATFORM_VERSION}: Sovereign Autonomous AI Cybersecurity Platform featuring the 10-Pillar Defense Grid, 5-LLM Consensus, NIST FIPS 203/204 Post-Quantum Enclaves, SagePatch AST Auto-Fix, and ${PLATFORM_DASHBOARD_MODULES_COUNT} Command Center Studios (${PLATFORM_WAVES_RANGE} · ${PLATFORM_CAPABILITIES_COUNT} Capabilities).`,
  keywords: [
    "cybersecurity",
    "AI security",
    "autonomous pentesting",
    "vulnerability scanner",
    "OSINT",
    "Post-Quantum Cryptography",
    "FIPS 203",
    "SOAR",
    "SagePatch"
  ],
  authors: [{ name: "SageAI Security Inc." }],
  openGraph: {
    title: `SageAI v${PLATFORM_VERSION} — Autonomous AI Pentester & Sovereign Defense Grid`,
    description: `Run an autonomous AI pentest in 60 seconds backed by ${PLATFORM_DASHBOARD_MODULES_COUNT} defense studios, 5-LLM consensus, Zero-Egress enclaves, and SagePatch AST remediation.`,
    url: SITE_URL,
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
    title: `SageAI v${PLATFORM_VERSION} — Autonomous AI Pentester`,
    description: "Run an autonomous AI pentest in 60 seconds with 10-Pillar Sovereign Defense, 5-LLM Consensus, and SagePatch AST Auto-Fix.",
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
import { CopilotDrawer } from "@/components/copilot/CopilotDrawer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
      const payloadPart = token.split(".")[1];
      if (payloadPart) {
        const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString());
        userEmail = payload.email || payload.sub || null;
      }
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
        <header className="px-6 py-3 flex items-center justify-between border-b border-emerald-900/30 z-40 relative backdrop-blur-sm bg-black/80 sticky top-0">
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
        <main className="flex-1 w-full relative z-0">
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </main>
        {userEmail && (
          <>
            <CommandPalette />
            <OnboardingWizard />
            <CopilotDrawer />
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
