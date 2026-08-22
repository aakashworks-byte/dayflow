"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  MapPin,
  Timer,
  AlertCircle,
  Sparkles,
  Download,
  CalendarDays,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDuration, formatTime, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { AttendanceRecord } from "@/types/hrms";

export default function AttendancePage() {
  const { user, isHrAdmin } = useAuth();
  const {
    isCheckedIn,
    toggleCheckIn,
    workingSeconds,
    attendanceRecords,
    regularizeAttendance,
    employees,
  } = useHRMS();
  const { toast } = useToast();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState("August 2026");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [regularizeNotes, setRegularizeNotes] = useState("");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("ALL");

  // Real-time live digital clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge variant="success">Present</Badge>;
      case "HALF_DAY":
        return <Badge variant="warning">Half Day</Badge>;
      case "ON_LEAVE":
        return <Badge variant="info">On Leave</Badge>;
      case "HOLIDAY":
        return <Badge variant="purple">Holiday</Badge>;
      case "WEEKEND":
        return <Badge variant="secondary">Weekend</Badge>;
      default:
        return <Badge variant="destructive">Absent</Badge>;
    }
  };

  const getHeatmapColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-500 text-white shadow-emerald-500/20";
      case "HALF_DAY":
        return "bg-amber-500 text-white shadow-amber-500/20";
      case "ON_LEAVE":
        return "bg-sky-500 text-white shadow-sky-500/20";
      case "HOLIDAY":
        return "bg-purple-600 text-white shadow-purple-500/20";
      case "WEEKEND":
        return "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground border-transparent";
      default:
        return "bg-red-500 text-white";
    }
  };

  const handleRegularizeSubmit = () => {
    if (!selectedRecord || !regularizeNotes) return;
    regularizeAttendance(selectedRecord.id, regularizeNotes);
    setSelectedRecord(null);
    setRegularizeNotes("");
  };

  const totalPresentDays = attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const totalHalfDays = attendanceRecords.filter((r) => r.status === "HALF_DAY").length;
  const totalLeaves = attendanceRecords.filter((r) => r.status === "ON_LEAVE").length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Big Check-In / Out Button with Live Digital Clock */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-purple-950/10 to-card p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Clock & Status */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Badge variant={isCheckedIn ? "success" : "secondary"} className="text-xs px-2.5 py-0.5">
                {isCheckedIn ? "Active Workday Session" : "Currently Checked Out"}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-purple-600" />
                {user?.location_name || "Office Hub"}
              </span>
            </div>

            <div suppressHydrationWarning className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-foreground">
              {currentTime || "09:02:15 AM"}
            </div>

            <p className="text-xs text-muted-foreground">
              {isCheckedIn
                ? `Logged in since 09:02 AM • Active session duration: ${formatDuration(workingSeconds / 3600)}`
                : "Your shift has not started yet. Tap the button to start logging attendance."}
            </p>
          </div>

          {/* Right: Big Interactive Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={toggleCheckIn}
              variant={isCheckedIn ? "destructive" : "purple"}
              size="lg"
              className="h-16 px-8 rounded-2xl text-base sm:text-lg font-bold gap-3 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle2 className="h-6 w-6 animate-pulse" />
                  <span>Check Out Now</span>
                </>
              ) : (
                <>
                  <Clock className="h-6 w-6" />
                  <span>Check In for Shift</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Heatmap & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid (2 cols) */}
        <Card className="border border-border/70 rounded-3xl shadow-sm overflow-hidden lg:col-span-2">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Monthly Attendance Heatmap ({selectedMonth})
              </CardTitle>
              <CardDescription className="text-xs">
                Visual day-by-day attendance grid
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => toast({ title: "Viewing Previous Month", description: "Showing July 2026 records" })}
                className="h-7 w-7 rounded-lg"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-semibold text-foreground px-1">{selectedMonth}</span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => toast({ title: "Current Month", description: "Showing August 2026 records" })}
                className="h-7 w-7 rounded-lg"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-2">
            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="font-bold text-[11px] text-muted-foreground pb-1">
                  {d}
                </div>
              ))}

              {/* Offset for Aug 1, 2026 (Saturday = col 6) */}
              <div />
              <div />
              <div />
              <div />
              <div />

              {/* 31 Days of Month */}
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const rec = attendanceRecords.find(
                  (r) => r.date === `2026-08-${dayNum.toString().padStart(2, "0")}`
                );

                const status = rec?.status || (dayNum > 22 ? "FUTURE" : "PRESENT");
                const isToday = dayNum === 22;

                return (
                  <div
                    key={dayNum}
                    title={rec ? `${rec.date}: ${rec.status} (${rec.duration_hours} hrs)` : `Day ${dayNum}`}
                    className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-transform hover:scale-105 cursor-pointer shadow-sm relative ${
                      isToday ? "ring-2 ring-purple-600 ring-offset-2 ring-offset-background" : ""
                    } ${
                      status === "FUTURE"
                        ? "bg-muted/30 text-muted-foreground/50"
                        : getHeatmapColor(status)
                    }`}
                  >
                    <span>{dayNum}</span>
                    {rec && rec.duration_hours > 0 && (
                      <span className="text-[9px] font-normal opacity-90 leading-none">
                        {rec.duration_hours}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-emerald-500" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-amber-500" />
                <span>Half-Day</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-sky-500" />
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-purple-600" />
                <span>Holiday</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-md bg-zinc-400" />
                <span>Weekend</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Month Summary Stats Card (1 col) */}
        <Card className="border border-border/70 rounded-3xl shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Monthly Overview
            </CardTitle>
            <CardDescription className="text-xs">
              Performance metrics for August 2026
            </CardDescription>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Days Present</span>
                <span className="font-extrabold text-sm text-foreground">{totalPresentDays} days</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="font-semibold text-amber-700 dark:text-amber-300">Half Days</span>
                <span className="font-extrabold text-sm text-foreground">{totalHalfDays} day</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <span className="font-semibold text-sky-700 dark:text-sky-300">Leaves Taken</span>
                <span className="font-extrabold text-sm text-foreground">{totalLeaves} day</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="font-semibold text-purple-700 dark:text-purple-300">Average Hours / Day</span>
                <span className="font-extrabold text-sm text-foreground">8.6 hrs</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast({
                title: "Attendance Report Exported 📊",
                description: "August 2026 attendance records downloaded as CSV.",
                variant: "success",
              })
            }
            className="w-full rounded-xl text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400"
          >
            <Download className="h-3.5 w-3.5" />
            Export Monthly Attendance (.csv)
          </Button>
        </Card>
      </div>

      {/* Historical Records Table */}
      <Card className="border border-border/70 rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-semibold">Attendance Log History</CardTitle>
            <CardDescription className="text-xs">
              Daily check-in and check-out timestamps with regularization actions
            </CardDescription>
          </div>

          {/* HR Filter if Admin */}
          {isHrAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter Employee:</span>
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="h-8 rounded-xl border border-input bg-background px-2 text-xs focus-visible:ring-1"
              >
                <option value="ALL">All Employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.display_name} ({e.employee_code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.slice().reverse().map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-semibold text-xs text-foreground">
                    {formatDate(rec.date)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {rec.check_in ? formatTime(rec.check_in) : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {rec.check_out ? formatTime(rec.check_out) : rec.status === "PRESENT" && rec.date === "2026-08-22" ? "In Progress" : "—"}
                  </TableCell>
                  <TableCell className="text-xs font-bold">
                    {rec.duration_hours > 0 ? `${rec.duration_hours} hrs` : "—"}
                  </TableCell>
                  <TableCell>{getStatusBadge(rec.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {rec.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {rec.status === "HALF_DAY" || rec.status === "ABSENT" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRecord(rec)}
                        className="h-7 text-xs rounded-lg border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold"
                      >
                        Regularize
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Regularization Modal */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-purple-600" />
                Request Attendance Regularization
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit reason for regularizing date: {formatDate(selectedRecord.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Status:</span>
                  <span className="font-semibold text-foreground">{selectedRecord.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hours Logged:</span>
                  <span className="font-semibold text-foreground">{selectedRecord.duration_hours} hrs</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Reason for Regularization (e.g. Biometric issue / Client site)
                </label>
                <Textarea
                  value={regularizeNotes}
                  onChange={(e) => setRegularizeNotes(e.target.value)}
                  placeholder="Explain why the check-in or checkout was missed..."
                  className="text-xs rounded-xl"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="purple"
                size="sm"
                onClick={handleRegularizeSubmit}
                className="rounded-xl text-xs font-semibold"
              >
                Submit Regularization
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
