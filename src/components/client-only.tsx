"use client";

import React, { useEffect, useState } from "react";

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Loading Dayflow HRMS...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
