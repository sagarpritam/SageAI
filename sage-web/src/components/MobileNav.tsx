"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  links: { href: string; label: string }[];
  userEmail: string | null;
}

export function MobileNav({ links, userEmail }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  if (!userEmail) return null;

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-zinc-400 hover:text-white transition-colors"
        aria-label="Toggle navigation menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-emerald-900/30 z-50">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-mono text-zinc-400 hover:text-emerald-400 px-3 py-2.5 rounded-lg hover:bg-emerald-900/20 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-zinc-800 mt-2 pt-2">
              <span className="text-xs font-mono text-zinc-600 px-3">{userEmail}</span>
              <a
                href="/api/auth/logout"
                className="block text-sm font-mono text-red-400/70 hover:text-red-300 px-3 py-2.5 rounded-lg hover:bg-red-900/20 transition-all mt-1"
              >
                Sign Out
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
