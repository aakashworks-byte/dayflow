"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  CreditCard,
  ShieldAlert,
  Building2,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle,
  Timer,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user, isHrAdmin } = useAuth();
  const { isCheckedIn, toggleCheckIn, workingSeconds, leaveRequests } = useHRMS();

  const pendingLeavesCount = leaveRequests.filter((r) => r.status === "PENDING").length;

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    ...(isHrAdmin
      ? [
          {
            title: "Admin Command Center",
            href: "/admin",
            icon: ShieldAlert,
            badge: "HR",
            badgeColor: "orange",
          },
        ]
      : []),
    {
      title: "My Profile",
      href: "/profile",
      icon: User,
      badge: null,
    },
    {
      title: "Attendance & Logs",
      href: "/attendance",
      icon: Clock,
      badge: isCheckedIn ? "Active" : null,
      badgeColor: isCheckedIn ? "success" : "secondary",
    },
    {
      title: "Leaves & Time-Off",
      href: "/leaves",
      icon: CalendarDays,
      badge: pendingLeavesCount > 0 ? `${pendingLeavesCount} pending` : null,
      badgeColor: "purple",
    },
    {
      title: "Payroll & Salary",
      href: "/payroll",
      icon: CreditCard,
      badge: "₹ INR",
      badgeColor: "secondary",
    },
  ];

  return (
    <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-border/70 bg-sidebar-background p-4 text-sidebar-foreground sticky top-16 select-none">
      <div className="flex flex-col gap-6">
        {/* Organization / Tenant Capsule */}
        <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold text-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-foreground">Acme Corporation</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                {user?.location_name?.split(" ")[0] || "HQ"}
              </span>
            </div>
          </div>
          <Badge variant="purple" className="text-[9px] px-1.5 py-0">
            Enterprise
          </Badge>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1">
          <span className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Main Menu
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20 font-semibold"
                    : "text-muted-foreground hover:bg-purple-500/10 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-purple-600"
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={(item.badgeColor || "default") as any}
                    className={`text-[9px] px-1.5 py-0 ${
                      isActive ? "bg-white/20 text-white border-transparent" : ""
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Check-In / Session Widget */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-purple-500/10 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-[11px] font-semibold text-foreground">Daily Session</span>
          </div>
          <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
            {formatDuration(workingSeconds / 3600)}
          </span>
        </div>

        <Button
          onClick={toggleCheckIn}
          variant={isCheckedIn ? "destructive" : "purple"}
          size="sm"
          className="w-full text-xs font-semibold gap-1.5 rounded-xl shadow-sm"
        >
          {isCheckedIn ? (
            <>
              <CheckCircle className="h-3.5 w-3.5" />
              Check Out
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5" />
              Check In Now
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem("dayflow_active_user_id");
            } catch {}
            window.location.href = "/login";
          }}
          className="w-full mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-red-500 py-1 transition-colors"
        >
          <span>Sign Out of Account</span>
        </button>
      </div>
    </aside>
  );
}
