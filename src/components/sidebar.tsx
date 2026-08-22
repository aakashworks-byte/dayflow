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
  Calendar,
  Sparkles,
  MapPin,
  CheckCircle,
  Timer,
  Users,
  BrainCircuit,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user, isHrAdmin, logout } = useAuth();
  const { isCheckedIn, toggleCheckIn, workingSeconds, leaveRequests } = useHRMS();

  const pendingLeavesCount = leaveRequests.filter((r) => r.status === "PENDING").length;

  const navSections = [
    {
      title: "WORKFORCE",
      items: [
        {
          title: "Overview",
          href: "/",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          title: "My Profile",
          href: "/profile",
          icon: User,
          badge: null,
        },
        ...(isHrAdmin
          ? [
              {
                title: "Employee Directory",
                href: "/admin",
                icon: Users,
                badge: "Admin",
                badgeColor: "purple",
              },
            ]
          : []),
      ],
    },
    {
      title: "TIME & ATTENDANCE",
      items: [
        {
          title: "Attendance Tracker",
          href: "/attendance",
          icon: Clock,
          badge: isCheckedIn ? "Active" : null,
          badgeColor: isCheckedIn ? "success" : "secondary",
        },
        {
          title: "Team Calendar",
          href: "/calendar",
          icon: Calendar,
          badge: "2026",
          badgeColor: "secondary",
        },
      ],
    },
    {
      title: "LEAVES & INTELLIGENCE",
      items: [
        {
          title: "Leaves & Time-Off",
          href: "/leaves",
          icon: CalendarDays,
          badge: pendingLeavesCount > 0 ? `${pendingLeavesCount} pending` : null,
          badgeColor: "orange",
        },
      ],
    },
    {
      title: "PAY & COMPLIANCE",
      items: [
        {
          title: "Payroll & Payslips",
          href: "/payroll",
          icon: CreditCard,
          badge: "₹ INR",
          badgeColor: "secondary",
        },
      ],
    },
    ...(isHrAdmin
      ? [
          {
            title: "OPERATIONS & HR",
            items: [
              {
                title: "Admin Command Center",
                href: "/admin",
                icon: ShieldAlert,
                badge: "HR",
                badgeColor: "orange",
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-border/80 bg-card/60 backdrop-blur-xl p-3.5 text-foreground sticky top-16 select-none overflow-y-auto">
      <div className="flex flex-col gap-5">
        {/* Organization / Tenant Capsule */}
        <div className="rounded-2xl border border-border/70 bg-muted/40 p-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-bold text-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-foreground tracking-tight">NMIT</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 text-purple-500" />
                Bengaluru Campus
              </span>
            </div>
          </div>
          <Badge variant="purple" className="text-[9px] px-1.5 py-0 font-semibold">
            PRO
          </Badge>
        </div>

        {/* Sectioned Navigation Menu */}
        <div className="flex flex-col gap-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span className="px-2.5 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {section.title}
              </span>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-600/25 font-semibold"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                          isActive ? "text-white" : "text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400"
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
          ))}
        </div>
      </div>

      {/* Bottom Check-In / Session Widget & Profile Footer */}
      <div className="space-y-2 pt-3 border-t border-border/60">
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-purple-500/10 p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-[11px] font-semibold text-foreground">Today's Session</span>
            </div>
            <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
              {formatDuration(workingSeconds / 3600)}
            </span>
          </div>

          <Button
            onClick={toggleCheckIn}
            variant={isCheckedIn ? "destructive" : "purple"}
            size="sm"
            className="w-full text-xs font-semibold gap-1.5 rounded-xl shadow-xs h-8"
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
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-red-500 py-1 transition-colors rounded-lg hover:bg-red-500/5"
        >
          <LogOut className="h-3 w-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
