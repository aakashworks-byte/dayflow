"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  LogOut,
  User,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronDown,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

interface NavbarProps {
  onOpenSearch?: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const { user, role, logout, switchUser, availableUsers, isHrAdmin } = useAuth();
  const { notifications, unreadNotificationCount, markAllNotificationsAsRead, isCheckedIn } = useHRMS();
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadgeVariant = (r: string) => {
    switch (r) {
      case "SUPER_ADMIN":
        return "purple";
      case "HR_ADMIN":
        return "orange";
      case "LINE_MANAGER":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/80 px-4 md:px-6 backdrop-blur-md transition-all">
      {/* Left side: Logo & Tagline */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              Dayflow
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.2 rounded-full">
                HRMS
              </span>
            </span>
            <span className="hidden md:inline-block text-[11px] text-muted-foreground tracking-tight -mt-0.5">
              Every workday, perfectly aligned.
            </span>
          </div>
        </Link>

        {/* Live Attendance Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-border/60">
          <div className={`h-2.5 w-2.5 rounded-full ${isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
          <span className="text-xs font-medium text-muted-foreground">
            {isCheckedIn ? "Checked In (Active)" : "Checked Out"}
          </span>
        </div>
      </div>

      {/* Center / Search Trigger */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSearch}
          className="hidden sm:flex h-9 w-64 items-center justify-between rounded-xl bg-muted/40 px-3 text-xs text-muted-foreground hover:bg-muted hover:border-purple-500/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Search employees, actions...</span>
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Role Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2.5 text-xs font-medium gap-1.5 rounded-xl border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300"
            >
              <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-semibold">{role.replace("_", " ")}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 glass-panel">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              ⚡ Demo Switcher: Test Personas
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableUsers.map((u) => (
              <DropdownMenuItem
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`flex items-center justify-between cursor-pointer py-2 ${
                  user?.id === u.id ? "bg-purple-500/10 font-semibold text-purple-600 dark:text-purple-400" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={u.avatar_url} />
                    <AvatarFallback className="text-[10px]">{u.first_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs">{u.display_name}</span>
                    <span className="text-[10px] text-muted-foreground leading-none">{u.job_title}</span>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(u.role) as any} className="text-[9px] px-1.5 py-0">
                  {u.role}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Dropdown */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative h-9 w-9 rounded-full border border-border/50 text-foreground hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F97316] text-[9px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96 glass-panel p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadNotificationCount > 0 && (
                  <Badge variant="orange" className="text-[10px]">
                    {unreadNotificationCount} new
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsAsRead}
                className="h-auto p-0 text-[11px] text-purple-600 dark:text-purple-400 hover:underline"
              >
                Mark all as read
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-colors hover:bg-muted/40 flex items-start gap-3 ${
                      !n.read ? "bg-purple-500/5 dark:bg-purple-950/20" : ""
                    }`}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                      {n.type === "PAYROLL" ? (
                        "₹"
                      ) : n.type === "LEAVE" ? (
                        <Calendar className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-xs font-semibold text-foreground">{n.title}</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground/80 mt-1">
                        {formatDate(n.timestamp)}
                      </span>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-[#F97316] shrink-0 mt-1" />}
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 rounded-full pl-2 pr-1 gap-2 hover:bg-accent border border-border/50"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar_url} alt={user?.display_name} />
                <AvatarFallback>{user?.first_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-xs font-medium text-foreground max-w-[100px] truncate">
                {user?.first_name}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60 hidden md:inline-block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-panel">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.display_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.work_email}</p>
                <div className="pt-1">
                  <Badge variant={getRoleBadgeVariant(role) as any} className="text-[10px]">
                    {role.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            {isHrAdmin && (
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/admin" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Admin Hub</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/attendance" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Attendance</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
