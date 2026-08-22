"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Clock,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Timer,
  BrainCircuit,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatINR, formatDuration, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyAttendanceData = [
  { day: "Mon", hours: 9.0, expected: 8.0 },
  { day: "Tue", hours: 9.2, expected: 8.0 },
  { day: "Wed", hours: 8.8, expected: 8.0 },
  { day: "Thu", hours: 9.5, expected: 8.0 },
  { day: "Fri", hours: 9.2, expected: 8.0 },
  { day: "Sat", hours: 0.0, expected: 0.0 },
  { day: "Sun", hours: 0.0, expected: 0.0 },
];

export default function DashboardPage() {
  const { user, isHrAdmin, role } = useAuth();
  const {
    isCheckedIn,
    toggleCheckIn,
    workingSeconds,
    leaveBalances,
    leaveRequests,
    activityFeed,
    attendanceRecords,
  } = useHRMS();

  const userBalance = (user && leaveBalances[user.id]) || {
    casual: { total: 12, used: 3, remaining: 9 },
    sick: { total: 12, used: 2, remaining: 10 },
    privilege: { total: 18, used: 4, remaining: 14 },
    unpaid: { total: 10, used: 0, remaining: 10 },
  };

  const myPendingLeaves = leaveRequests.filter(
    (r) => r.status === "PENDING"
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-orange-500/10 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="text-xs px-2.5 py-0.5 font-semibold">
                {role.replace("_", " ")}
              </Badge>
              <span suppressHydrationWarning className="text-xs text-muted-foreground font-medium">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              Welcome back, Dhruv Singh! 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Lead Software Architect & Tech Lead • Core Platform Engineering • Bengaluru Hub
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isHrAdmin && (
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 border-orange-500/30 text-orange-600 dark:text-orange-400 font-semibold">
                <Link href="/admin">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Hub
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold">
              <Link href="/leaves">
                <BrainCircuit className="h-4 w-4" />
                Smart Leave Planner
              </Link>
            </Button>

            <Button
              onClick={toggleCheckIn}
              variant={isCheckedIn ? "destructive" : "purple"}
              className="rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md shadow-purple-600/25"
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Check Out ({formatDuration(workingSeconds / 3600)})
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  Check In Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Quick Access Cards with Polished Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Quick Card 1: Profile */}
        <Link href="/profile" prefetch={true} className="group">
          <Card className="h-full border border-border/70 hover:border-purple-500/50 hover:shadow-md transition-all rounded-3xl overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <User className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono font-bold">
                  EMP-001
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  My Profile & Vault
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  Dhruv Singh • Credentials & Structure
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 pt-1">
                <span>View Profile</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Quick Card 2: Attendance */}
        <Link href="/attendance" prefetch={true} className="group">
          <Card className="h-full border border-border/70 hover:border-emerald-500/50 hover:shadow-md transition-all rounded-3xl overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
                <Badge variant={isCheckedIn ? "success" : "secondary"} className="text-[10px]">
                  {isCheckedIn ? "Active" : "Logged Out"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Attendance Tracker
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Today: {formatDuration(workingSeconds / 3600)} logged
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                <span>View Daily Heatmap</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Quick Card 3: Smart Leaves & Policy Engine */}
        <Link href="/leaves" prefetch={true} className="group">
          <Card className="h-full border border-border/70 hover:border-purple-500/50 hover:shadow-md transition-all rounded-3xl overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <Badge variant="purple" className="text-[10px]">
                  {userBalance.casual.remaining + userBalance.sick.remaining + userBalance.privilege.remaining} left
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Smart Leave Planner
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI Policy checks & Decision Trace
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 pt-1">
                <span>Open Planner</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Quick Card 4: Payroll (₹ INR) */}
        <Link href="/payroll" prefetch={true} className="group">
          <Card className="h-full border border-border/70 hover:border-purple-500/50 hover:shadow-md transition-all rounded-3xl overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <span className="font-extrabold text-base">₹</span>
                </div>
                <Badge variant="purple" className="text-[10px]">
                  FY 2026-27
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Payroll & Payslips
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Net Pay: {formatINR(180000)} / mo
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 pt-1">
                <span>Download PDF Slip</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Middle Section: Weekly Attendance Chart & Leave Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Trend Area Chart */}
        <Card className="lg:col-span-2 border border-border/80 rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-border/60">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Weekly Working Hours Trend
              </CardTitle>
              <CardDescription className="text-xs">
                Consistent 9.1h daily attendance logs across Core Platform team
              </CardDescription>
            </div>
            <Badge variant="success" className="text-xs">
              98% Compliance
            </Badge>
          </CardHeader>

          <CardContent className="p-5">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} domain={[0, 12]} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border bg-popover p-2 shadow-md text-xs">
                            <p className="font-bold">{payload[0].payload.day}</p>
                            <p className="text-purple-600 font-semibold">{payload[0].value} hrs logged</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#purpleGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Leave Balances & Quota Widget */}
        <Card className="border border-border/80 rounded-3xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">Time-Off Balances</CardTitle>
              <Badge variant="purple" className="text-xs">
                FY 2026-27
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Available quota for Dhruv Singh
            </CardDescription>

            <div className="space-y-3.5 mt-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-purple-700 dark:text-purple-300">Paid Leave (PL)</span>
                  <span className="font-bold">{userBalance.privilege.remaining} / {userBalance.privilege.total} days</span>
                </div>
                <Progress value={(userBalance.privilege.remaining / userBalance.privilege.total) * 100} className="h-1.5 bg-purple-200 dark:bg-purple-950" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-orange-700 dark:text-orange-300">Sick Leave (SL)</span>
                  <span className="font-bold">{userBalance.sick.remaining} / {userBalance.sick.total} days</span>
                </div>
                <Progress value={(userBalance.sick.remaining / userBalance.sick.total) * 100} className="h-1.5 bg-orange-200 dark:bg-orange-950" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-emerald-700 dark:text-emerald-300">Casual Leave (CL)</span>
                  <span className="font-bold">{userBalance.casual.remaining} / {userBalance.casual.total} days</span>
                </div>
                <Progress value={(userBalance.casual.remaining / userBalance.casual.total) * 100} className="h-1.5 bg-emerald-200 dark:bg-emerald-950" />
              </div>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="w-full text-xs font-semibold rounded-xl mt-4 border-purple-500/30 text-purple-600 dark:text-purple-400">
            <Link href="/leaves">
              Apply via Smart Planner
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </Card>
      </div>

      {/* Bottom Section: Real-Time Activity & Audit Feed */}
      <Card className="border border-border/80 rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Real-Time Workspace Activity Feed
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Live Feed
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="divide-y divide-border/50">
            {activityFeed.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-1 ring-purple-500/30">
                    <AvatarImage src={act.actor_avatar} />
                    <AvatarFallback className="text-[10px]">DS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-foreground">
                      <strong className="font-semibold">{act.actor_name}</strong> {act.action}{" "}
                      <span className="font-medium text-purple-600 dark:text-purple-400">{act.target}</span>
                    </p>
                    <span className="text-[10.5px] text-muted-foreground">{act.timestamp}</span>
                  </div>
                </div>
                <Badge variant={act.type === "PAYROLL" ? "success" : act.type === "LEAVE" ? "purple" : "secondary"} className="text-[9px]">
                  {act.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
