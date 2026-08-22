import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-purple-950/10 to-background overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-15%] left-[20%] h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[20%] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />

      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md z-10">{children}</div>
    </div>
  );
}
