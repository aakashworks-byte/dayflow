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
  BarChart,
  Bar,
} from "recharts";

// Sample chart data for weekly attendance hours
const weeklyAttendanceData = [
  { day: "Mon", hours: 8.5, expected: 8.0 },
  { day: "Tue", hours: 8.8, expected: 8.0 },
  { day: "Wed", hours: 9.1, expected: 8.0 },
  { day: "Thu", hours: 8.2, expected: 8.0 },
  { day: "Fri", hours: 8.6, expected: 8.0 },
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
    casual: { total: 12, used: 4, remaining: 8 },
    sick: { total: 10, used: 2, remaining: 8 },
    privilege: { total: 18, used: 3, remaining: 15 },
    unpaid: { total: 30, used: 0, remaining: 30 },
  };

  const myPendingLeaves = leaveRequests.filter(
    (r) => r.employee_id === user?.id && r.status === "PENDING"
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-orange-500/10 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="text-xs px-2 py-0.5 font-semibold">
                {role.replace("_", " ")}
              </Badge>
              <span suppressHydrationWarning className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Welcome back, {user?.display_name || "Employee"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              {user?.job_title} • {user?.department_name} • {user?.location_name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isHrAdmin && (
              <Button asChild variant="glass" size="sm" className="rounded-xl text-xs gap-1.5 border-orange-500/30">
                <Link href="/admin">
                  <ShieldCheck className="h-4 w-4 text-orange-500" />
                  Admin Hub
                </Link>
              </Button>
            )}

            <Button
              onClick={toggleCheckIn}
              variant={isCheckedIn ? "destructive" : "purple"}
              className="rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md"
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Check Out ({formatDuration(workingSeconds / 3600)})
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  Check In for Work
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Quick Card 1: Profile */}
        <Link href="/profile" className="group">
          <Card className="h-full border border-border/70 hover:border-purple-500/50 hover:shadow-lg transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <User className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {user?.employee_code}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  My Profile & Documents
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  Bio, contacts, and verified credentials
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
        <Link href="/attendance" className="group">
          <Card className="h-full border border-border/70 hover:border-purple-500/50 hover:shadow-lg transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
                <Badge variant={isCheckedIn ? "success" : "secondary"} className="text-[10px]">
                  {isCheckedIn ? "Active" : "Logged Out"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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

        {/* Quick Card 3: Leaves */}
        <Link href="/leaves" className="group">
          <Card className="h-full border border-border/70 hover:border-purple-500/50 hover:shadow-lg transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <Badge variant="warning" className="text-[10px]">
                  {userBalance.casual.remaining + userBalance.sick.remaining + userBalance.privilege.remaining} left
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Time-Off & Leaves
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {myPendingLeaves.length > 0 ? `${myPendingLeaves.length} request pending` : "No pending leaves"}
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 pt-1">
                <span>Apply for Leave</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Quick Card 4: Payroll */}
        <Link href="/payroll" className="group">
          <Card className="h-full border border-border/70 hover:border-purple-500/50 hover:shadow-lg transition-all rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <span className="font-bold text-base">₹</span>
                </div>
                <Badge variant="purple" className="text-[10px]">
                  Jul 2026 Paid
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Payroll & Payslips
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Net: {formatINR(user?.salary_structure?.net_salary || 145000)}/mo
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 pt-1">
                <span>Download Slip PDF</span>
                <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Two Column Grid: Left analytics + Right Live widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Weekly Trend & Leave Balances */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Trend Chart */}
          <Card className="border border-border/70 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Weekly Attendance & Hours</CardTitle>
                <CardDescription className="text-xs">
                  Hours logged this week vs standard 8h target
                </CardDescription>
              </div>
              <Badge variant="success" className="text-xs">
                Avg 8.6 hrs / day
              </Badge>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyAttendanceData}>
                    <defs>
                      <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                    <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} domain={[0, 12]} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "rgba(18, 18, 24, 0.95)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#7C3AED"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#purpleGlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leave Balances Widget */}
          <Card className="border border-border/70 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Leave Quotas & Balances</CardTitle>
                <CardDescription className="text-xs">
                  Remaining leaves for fiscal year 2026–27
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="h-8 rounded-xl text-xs gap-1 border-purple-500/30">
                <Link href="/leaves">
                  <PlusCircle className="h-3.5 w-3.5 text-purple-600" />
                  Apply Leave
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-5 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Casual Leave */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Casual Leave
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {userBalance.casual.remaining} / {userBalance.casual.total}
                  </span>
                </div>
                <Progress
                  value={(userBalance.casual.remaining / userBalance.casual.total) * 100}
                  className="h-2"
                />
                <span className="text-[10px] text-muted-foreground block">
                  {userBalance.casual.used} days utilized
                </span>
              </div>

              {/* Sick Leave */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Sick Leave
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {userBalance.sick.remaining} / {userBalance.sick.total}
                  </span>
                </div>
                <Progress
                  value={(userBalance.sick.remaining / userBalance.sick.total) * 100}
                  className="h-2"
                  indicatorColor="bg-gradient-to-r from-emerald-500 to-teal-500"
                />
                <span className="text-[10px] text-muted-foreground block">
                  {userBalance.sick.used} days utilized
                </span>
              </div>

              {/* Privilege Leave */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    Privilege Leave
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {userBalance.privilege.remaining} / {userBalance.privilege.total}
                  </span>
                </div>
                <Progress
                  value={(userBalance.privilege.remaining / userBalance.privilege.total) * 100}
                  className="h-2"
                  indicatorColor="bg-gradient-to-r from-amber-500 to-orange-500"
                />
                <span className="text-[10px] text-muted-foreground block">
                  {userBalance.privilege.used} days utilized
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Live Activity Feed & Quick Actions */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <Card className="border border-border/70 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Recent Activity
                </CardTitle>
                <Badge variant="purple" className="text-[10px]">
                  Real-time
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Company-wide updates & notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {activityFeed.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl transition-colors hover:bg-muted/40 border border-transparent hover:border-border/40"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={act.actor_avatar} />
                      <AvatarFallback>{act.actor_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">
                        <span className="font-semibold">{act.actor_name}</span>{" "}
                        <span className="text-muted-foreground">{act.action}</span>{" "}
                        <span className="font-medium text-purple-600 dark:text-purple-400 truncate">
                          {act.target}
                        </span>
                      </p>
                      <span className="text-[10px] text-muted-foreground/80">{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info & Help Widget */}
          <Card className="border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-purple-500/5 rounded-2xl overflow-hidden shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F97316]/15 text-[#F97316]">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Work Location</h4>
                <p className="text-[11px] text-muted-foreground">{user?.location_name}</p>
              </div>
            </div>
            <div className="border-t border-border/50 pt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Manager:</span>
              <span className="font-semibold text-foreground">{user?.manager_name || "Alex Vance (CEO)"}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Emergency Support:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">hr@dayflow.io</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
