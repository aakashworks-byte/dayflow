"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { CommandMenu } from "@/components/command-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar onOpenSearch={() => setCommandOpen(true)} />

      {/* Main workspace layout with Sidebar and content */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
        <Sidebar />

        {/* Dynamic page container */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Spotlight Command Palette (Ctrl+K) */}
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
