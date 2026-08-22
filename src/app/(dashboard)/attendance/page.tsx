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
  Building2,
  Laptop,
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
import {
  BarChart,
  Bar,
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

export default function AttendancePage() {
  const { user } = useAuth();
  const {
    isCheckedIn,
    toggleCheckIn,
    workingSeconds,
    attendanceRecords,
    regularizeAttendance,
  } = useHRMS();
  const { toast } = useToast();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [regularizeNotes, setRegularizeNotes] = useState("");
  const [searchDate, setSearchDate] = useState("");

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

  const handleRegularizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !regularizeNotes) return;
    regularizeAttendance(selectedRecord.id, regularizeNotes);
    setSelectedRecord(null);
    setRegularizeNotes("");
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Date,Check In,Check Out,Status,Total Hours,Location,Device"]
        .concat(
          attendanceRecords.map(
            (r) =>
              `${r.date},${r.check_in},${r.check_out},${r.status},${r.total_hours},${r.location},${r.device}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Dayflow_Attendance_July_2026_EMP-001.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Attendance CSV Exported 📊",
      description: "Complete attendance ledger downloaded.",
      variant: "purple",
    });
  };

  const filteredRecords = attendanceRecords.filter((r) =>
    searchDate ? r.date.includes(searchDate) : true
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" className="text-xs px-2.5 py-0.5 font-semibold">
              Time & Attendance Hub
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">Asia/Kolkata (IST)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1 flex items-center gap-2">
            Attendance Tracker & Logs
            <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time biometric check-in, daily working hours, and monthly attendance heatmap for Dhruv Singh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="rounded-xl text-xs sm:text-sm font-semibold gap-1.5 border-border/70"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            onClick={toggleCheckIn}
            variant={isCheckedIn ? "destructive" : "purple"}
            className="rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md shadow-purple-600/25"
          >
            {isCheckedIn ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Check Out Now
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

      {/* Live Digital Clock & Quick Attendance Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Digital Clock Widget */}
        <Card className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-card to-indigo-950/10 p-6 shadow-md flex flex-col justify-between space-y-4 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Live System Clock
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {isCheckedIn ? "Session Active" : "Offline"}
                </span>
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground mt-3">
              {currentTime || "09:02:15 AM"}
            </div>
            <span suppressHydrationWarning className="text-xs text-muted-foreground mt-1 block">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Today's First Check-In:</span>
              <span className="font-bold text-foreground font-mono">09:02 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Logged Working Duration:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                {formatDuration(workingSeconds / 3600)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registered Work Location:</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-purple-500" /> Bengaluru Office
              </span>
            </div>
          </div>
        </Card>

        {/* Weekly Attendance Breakdown Chart */}
        <Card className="rounded-3xl border border-border/80 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Weekly Working Hours</CardTitle>
              <CardDescription className="text-xs">
                Actual logged hours vs 8.0h daily standard shift
              </CardDescription>
            </div>
            <Badge variant="purple" className="text-xs">
              Avg 9.1h / Day
            </Badge>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="hours" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 31-Day Attendance Heatmap Grid */}
      <Card className="border border-border/80 rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              July 2026 Attendance Heatmap (31 Days)
            </CardTitle>
            <CardDescription className="text-xs">
              Color-coded status across all calendar days for Dhruv Singh (EMP-001)
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Present (9.0h+)</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Leave</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-zinc-400" /> Weekend</span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 lg:grid-cols-31 gap-1.5 text-center">
            {attendanceRecords.map((r, idx) => {
              const dayNum = idx + 1;
              const isWeekend = r.status === "WEEKEND";
              const isPresent = r.status === "PRESENT";
              const isToday = dayNum === 24;

              return (
                <div
                  key={r.id}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[64px] transition-all cursor-pointer ${
                    isToday
                      ? "border-purple-600 bg-purple-500/20 ring-2 ring-purple-500/30 shadow-xs"
                      : isPresent
                      ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : isWeekend
                      ? "border-border/40 bg-muted/30 text-muted-foreground"
                      : "border-border/60 bg-card"
                  }`}
                  title={`${r.date}: ${r.status} (${r.total_hours}h)`}
                >
                  <span className={`text-[11px] font-bold ${isToday ? "text-purple-600 dark:text-purple-400" : ""}`}>
                    {dayNum}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {isPresent ? `${r.total_hours}h` : isWeekend ? "Off" : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Attendance History Table */}
      <Card className="border border-border/80 rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Daily Attendance Logs Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Full biometric check-in timestamps, GPS office location, and device verification
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="h-8 text-xs rounded-xl w-40"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location & Device</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold text-xs text-foreground font-mono">
                    {r.date}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{r.check_in}</TableCell>
                  <TableCell className="text-xs font-mono">{r.check_out}</TableCell>
                  <TableCell className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {r.total_hours} hrs
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === "PRESENT"
                          ? "success"
                          : r.status === "WEEKEND"
                          ? "secondary"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.location} • {r.device}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRecord(r)}
                      className="h-7 text-xs rounded-lg gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold"
                    >
                      <FileCheck className="h-3 w-3" />
                      Regularize
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Regularization Request Modal */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-purple-600" />
                Attendance Regularization Request
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit attendance correction for {selectedRecord.date}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegularizeSubmit} className="space-y-3.5 py-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <p><strong>Employee:</strong> Dhruv Singh (EMP-001)</p>
                <p><strong>Recorded Date:</strong> {selectedRecord.date}</p>
                <p><strong>Recorded Time:</strong> {selectedRecord.check_in} - {selectedRecord.check_out}</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Reason for Regularization</label>
                <Textarea
                  placeholder="e.g. Client onsite meeting, biometric machine sync delay..."
                  value={regularizeNotes}
                  onChange={(e) => setRegularizeNotes(e.target.value)}
                  className="text-xs rounded-xl"
                  rows={3}
                  required
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="purple" size="sm" className="rounded-xl text-xs font-semibold shadow-md">
                  Submit for Approval
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
