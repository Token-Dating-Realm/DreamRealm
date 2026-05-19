/**
 * AppShell
 *
 * Wraps authenticated pages with Navbar + Sidebar + main content area.
 * Manages mobile drawer state.
 */

"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex flex-1 flex-col md:ml-0">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
