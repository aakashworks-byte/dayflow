"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  CreditCard,
  User,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isHrAdmin } = useAuth();

  const links = [
    {
      title: "Home",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Attendance",
      href: "/attendance",
      icon: Clock,
    },
    {
      title: "Leaves",
      href: "/leaves",
      icon: CalendarDays,
    },
    {
      title: "Payroll",
      href: "/payroll",
      icon: CreditCard,
    },
    ...(isHrAdmin
      ? [
          {
            title: "Admin",
            href: "/admin",
            icon: ShieldAlert,
          },
        ]
      : [
          {
            title: "Profile",
            href: "/profile",
            icon: User,
          },
        ]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border/80 bg-background/90 px-2 backdrop-blur-lg shadow-2xl safe-area-pb">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-colors ${
              isActive
                ? "text-purple-600 dark:text-purple-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                isActive ? "bg-purple-600/15" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span>{link.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
