// src/components/Navbar.tsx
"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-black/60 text-white backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-green-500 h-9 w-9 rounded flex items-center justify-center font-bold">N</div>
          <span className="font-semibold">Nexus Nature</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link className="hover:underline" href="/map">Map</Link>
          <Link className="hover:underline" href="/challenges">Challenges</Link>
          <Link className="hover:underline" href="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}
