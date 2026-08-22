"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  CalendarDays,
  Filter,
  Download,
  Share2,
  Sun,
  MapPin,
  Plane,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Indian Gazetted Holidays 2026
const INDIAN_HOLIDAYS_2026 = [
  { date: "2026-01-26", name: "Republic Day", day: "Monday", type: "National Holiday" },
  { date: "2026-03-04", name: "Holi (Festival of Colors)", day: "Wednesday", type: "Gazetted Holiday" },
  { date: "2026-03-21", name: "Eid-ul-Fitr", day: "Saturday", type: "Gazetted Holiday" },
  { date: "2026-04-03", name: "Good Friday", day: "Friday", type: "Gazetted Holiday" },
  { date: "2026-04-14", name: "Dr. B.R. Ambedkar Jayanti", day: "Tuesday", type: "Gazetted Holiday" },
  { date: "2026-05-01", name: "Maharashtra Day / May Day", day: "Friday", type: "Regional Holiday" },
  { date: "2026-08-15", name: "Independence Day", day: "Saturday", type: "National Holiday" },
  { date: "2026-08-28", name: "Raksha Bandhan", day: "Friday", type: "Restricted Holiday" },
  { date: "2026-09-04", name: "Janmashtami", day: "Friday", type: "Gazetted Holiday" },
  { date: "2026-10-02", name: "Mahatma Gandhi Jayanti", day: "Friday", type: "National Holiday" },
  { date: "2026-10-20", name: "Dussehra (Vijayadashami)", day: "Tuesday", type: "Gazetted Holiday" },
  { date: "2026-11-08", name: "Diwali (Deepavali)", day: "Sunday", type: "Gazetted Holiday" },
  { date: "2026-11-09", name: "Govardhan Puja", day: "Monday", type: "Gazetted Holiday" },
  { date: "2026-11-24", name: "Guru Nanak Jayanti", day: "Tuesday", type: "Gazetted Holiday" },
  { date: "2026-12-25", name: "Christmas Day", day: "Friday", type: "Gazetted Holiday" },
];

const COMPANY_EVENTS = [
  { date: "2026-07-03", title: "Q2 All-Hands & Townhall", time: "4:00 PM - 5:30 PM", type: "EVENT", badge: "All-Hands" },
  { date: "2026-07-15", title: "Engineering Sprint Demo", time: "2:00 PM - 3:00 PM", type: "EVENT", badge: "Demo" },
  { date: "2026-07-24", title: "Dayflow Hackathon Showcase", time: "10:00 AM - 6:00 PM", type: "EVENT", badge: "Hackathon" },
  { date: "2026-07-31", title: "Monthly Payroll Finalized", time: "5:00 PM", type: "PAYROLL", badge: "Payroll ₹" },
  { date: "2026-08-07", title: "Q3 Strategy Kickoff", time: "11:00 AM - 12:30 PM", type: "EVENT", badge: "Strategy" },
  { date: "2026-08-14", title: "Independence Day Eve Celebration", time: "4:00 PM - 6:00 PM", type: "EVENT", badge: "Celebration" },
];

export default function CalendarPage() {
  const { user } = useAuth();
  const { leaveRequests, applyLeave } = useHRMS();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // July 2026
  const [selectedDateStr, setSelectedDateStr] = useState("2026-07-24");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HOLIDAYS" | "LEAVES" | "EVENTS">("ALL");
  const [viewMode, setViewMode] = useState<"MONTH" | "LIST">("MONTH");
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [leaveFormData, setLeaveFormData] = useState({
    leave_type: "PAID" as const,
    start_date: "2026-07-27",
    end_date: "2026-07-28",
    reason: "",
    is_half_day: false,
  });

  const monthYearStr = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0, Sun = 6

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date(2026, 6, 1));
    setSelectedDateStr("2026-07-24");
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveFormData.reason) {
      toast({
        title: "Reason Required",
        description: "Please enter a reason for your leave request.",
        variant: "destructive",
      });
      return;
    }

    applyLeave({
      leave_type: leaveFormData.leave_type,
      start_date: leaveFormData.start_date,
      end_date: leaveFormData.end_date,
      reason: leaveFormData.reason,
      is_half_day: leaveFormData.is_half_day,
      days_count: leaveFormData.is_half_day ? 0.5 : 2,
    });

    setShowApplyModal(false);
    setLeaveFormData({
      leave_type: "PAID",
      start_date: "2026-07-27",
      end_date: "2026-07-28",
      reason: "",
      is_half_day: false,
    });
  };

  // Get items for a date
  const getItemsForDate = (dateStr: string) => {
    const holidays = INDIAN_HOLIDAYS_2026.filter((h) => h.date === dateStr);
    const events = COMPANY_EVENTS.filter((e) => e.date === dateStr);
    const leaves = leaveRequests.filter((l) => {
      return dateStr >= l.start_date && dateStr <= l.end_date;
    });

    return { holidays, events, leaves };
  };

  const selectedItems = getItemsForDate(selectedDateStr);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Calendar Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" className="text-xs px-2.5 py-0.5 font-semibold">
              Workplace Calendar
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">IST (Asia/Kolkata)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1 flex items-center gap-2">
            Workforce & Leave Calendar
            <CalendarDays className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Coordinate team availability, gazetted holidays, sprint milestones, and time-off.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Switcher Controls */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/60">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={prevMonth}
              className="h-8 w-8 rounded-xl"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold px-2.5 min-w-[110px] text-center text-foreground">
              {monthYearStr}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={nextMonth}
              className="h-8 w-8 rounded-xl"
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={jumpToToday}
              className="h-8 px-2.5 text-xs rounded-xl ml-1 border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold"
            >
              Today
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border/60">
            <button
              onClick={() => setViewMode("MONTH")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                viewMode === "MONTH" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                viewMode === "LIST" ? "bg-purple-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Schedule List
            </button>
          </div>

          {/* Apply Leave Action Button */}
          <Button
            onClick={() => setShowApplyModal(true)}
            variant="purple"
            className="rounded-2xl text-xs sm:text-sm font-semibold gap-1.5 shadow-md shadow-purple-600/25"
          >
            <Plus className="h-4 w-4" />
            Apply Time-Off
          </Button>
        </div>
      </div>

      {/* Filter Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {(["ALL", "HOLIDAYS", "LEAVES", "EVENTS"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 text-xs rounded-xl font-medium transition-all ${
                activeFilter === filter
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter === "ALL" && "🌟 All Schedules"}
              {filter === "HOLIDAYS" && "🇮🇳 Indian Holidays"}
              {filter === "LEAVES" && "🌴 Team Leaves"}
              {filter === "EVENTS" && "🎪 Events & All-Hands"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Holiday
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Approved Leave
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Event
          </span>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (8 Cols), Schedule & Holidays Drawer on Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Full Interactive Month Calendar */}
        <Card className="lg:col-span-8 border border-border/80 rounded-3xl shadow-sm overflow-hidden backdrop-blur-xl bg-card/90">
          <CardHeader className="p-4 sm:p-5 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {monthYearStr}
              </CardTitle>
              <CardDescription className="text-xs">
                Click on any date to inspect details, approved leaves, or scheduled meetings.
              </CardDescription>
            </div>
            <Badge variant="purple" className="text-xs">
              {daysInMonth} Days
            </Badge>
          </CardHeader>

          <CardContent className="p-3 sm:p-5">
            {viewMode === "MONTH" ? (
              <div className="space-y-2">
                {/* 7-Day Header */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-muted-foreground pb-2 border-b border-border/40">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span className="text-purple-600 dark:text-purple-400">Sat</span>
                  <span className="text-red-500">Sun</span>
                </div>

                {/* Date Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {/* Empty Leading Cells */}
                  {Array.from({ length: startingOffset }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[72px] sm:min-h-[88px] rounded-2xl bg-muted/15 border border-transparent p-1.5 opacity-30 pointer-events-none"
                    />
                  ))}

                  {/* Days of Month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const isSelected = selectedDateStr === dateStr;
                    const isToday = dateStr === "2026-07-24";
                    const isWeekend = (startingOffset + i) % 7 === 5 || (startingOffset + i) % 7 === 6;

                    const { holidays, events, leaves } = getItemsForDate(dateStr);

                    const showHoliday = (activeFilter === "ALL" || activeFilter === "HOLIDAYS") && holidays.length > 0;
                    const showEvent = (activeFilter === "ALL" || activeFilter === "EVENTS") && events.length > 0;
                    const showLeave = (activeFilter === "ALL" || activeFilter === "LEAVES") && leaves.length > 0;

                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDateStr(dateStr)}
                        className={`min-h-[72px] sm:min-h-[88px] rounded-2xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-purple-600 bg-purple-500/15 shadow-md ring-2 ring-purple-500/30"
                            : isToday
                            ? "border-purple-500/50 bg-purple-500/5"
                            : isWeekend
                            ? "bg-muted/30 border-border/40 hover:border-purple-500/30"
                            : "bg-card hover:bg-muted/40 border-border/60 hover:border-purple-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold rounded-full flex items-center justify-center ${
                              isToday
                                ? "h-6 w-6 bg-purple-600 text-white shadow-sm"
                                : isSelected
                                ? "text-purple-600 dark:text-purple-400 font-extrabold"
                                : "text-foreground"
                            }`}
                          >
                            {dayNum}
                          </span>

                          {showHoliday && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500" title={holidays[0].name} />
                          )}
                        </div>

                        {/* Badges / Micro-Indicators */}
                        <div className="space-y-1 mt-1">
                          {showHoliday && (
                            <div className="rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1 py-0.5 text-[9px] font-semibold truncate">
                              {holidays[0].name}
                            </div>
                          )}

                          {showEvent && (
                            <div className="rounded-md bg-orange-500/15 text-orange-700 dark:text-orange-300 px-1 py-0.5 text-[9px] font-semibold truncate">
                              {events[0].badge}
                            </div>
                          )}

                          {showLeave && (
                            <div className="rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 px-1 py-0.5 text-[9px] font-semibold truncate">
                              {leaves[0].employee_name.split(" ")[0]}: {leaves[0].leave_type}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* List View of the Month's Schedules */
              <div className="space-y-3">
                {INDIAN_HOLIDAYS_2026.concat(
                  COMPANY_EVENTS.map((e) => ({
                    date: e.date,
                    name: `${e.title} (${e.time})`,
                    day: "Scheduled",
                    type: "Company Event",
                  }))
                )
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs">
                          {item.date.split("-")[2]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.date} • {item.day}</p>
                        </div>
                      </div>
                      <Badge variant={item.type.includes("Holiday") ? "success" : "purple"} className="text-[10px]">
                        {item.type}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right 4 Cols: Selected Date Details & Indian Gazetted Holidays Hub */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Date Inspector Card */}
          <Card className="border border-purple-500/30 rounded-3xl shadow-sm p-5 bg-gradient-to-b from-purple-500/5 to-transparent space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Selected Schedule
                </span>
                <h3 className="text-lg font-bold text-foreground">{selectedDateStr}</h3>
              </div>
              <Button
                size="sm"
                variant="purple"
                onClick={() => {
                  setLeaveFormData((prev) => ({ ...prev, start_date: selectedDateStr, end_date: selectedDateStr }));
                  setShowApplyModal(true);
                }}
                className="h-8 text-xs rounded-xl gap-1 shadow-sm font-semibold"
              >
                <Plus className="h-3 w-3" />
                Book Day
              </Button>
            </div>

            {/* List of items on this date */}
            <div className="space-y-3">
              {selectedItems.holidays.length === 0 && selectedItems.events.length === 0 && selectedItems.leaves.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground rounded-2xl bg-muted/30 border border-dashed border-border/60">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1 opacity-80" />
                  <span>Standard working workday. No public holidays or team leaves scheduled.</span>
                </div>
              ) : (
                <>
                  {selectedItems.holidays.map((h, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">🇮🇳 {h.name}</span>
                        <Badge variant="success" className="text-[9px]">{h.type}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Official paid national/gazetted holiday for all Acme employees.</p>
                    </div>
                  ))}

                  {selectedItems.events.map((e, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-300">🎪 {e.title}</span>
                        <Badge variant="orange" className="text-[9px]">{e.badge}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Time: {e.time} • Google Meet sync enabled</p>
                    </div>
                  ))}

                  {selectedItems.leaves.map((l, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">🌴 {l.employee_name}</span>
                        <Badge variant="purple" className="text-[9px]">{l.leave_type}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Status: {l.status} • Reason: "{l.reason}"</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>

          {/* Upcoming Indian Gazetted Holidays 2026 */}
          <Card className="border border-border/70 rounded-3xl shadow-sm overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Upcoming Gazetted Holidays (2026)
                </CardTitle>
                <Badge variant="purple" className="text-[10px]">
                  India Calendar
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Official statutory leaves observed by Acme Corporation
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-2.5">
              {INDIAN_HOLIDAYS_2026.slice(6, 12).map((h, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-foreground block">{h.name}</span>
                    <span className="text-[10px] text-muted-foreground">{h.date} ({h.day})</span>
                  </div>
                  <Badge variant="success" className="text-[9px] px-1.5 py-0">
                    {h.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Time-Off Modal */}
      {showApplyModal && (
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-purple-600" />
                Schedule Time-Off / Leave
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit a leave request for manager approval
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleApplySubmit} className="space-y-3.5 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Leave Category</label>
                <select
                  value={leaveFormData.leave_type}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leave_type: e.target.value as any })}
                  className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1"
                >
                  <option value="PAID">Paid / Privilege Leave (PL)</option>
                  <option value="SICK">Sick / Medical Leave (SL)</option>
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="UNPAID">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={leaveFormData.start_date}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, start_date: e.target.value })}
                    className="text-xs h-9 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={leaveFormData.end_date}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, end_date: e.target.value })}
                    className="text-xs h-9 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="half-day"
                  checked={leaveFormData.is_half_day}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, is_half_day: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="half-day" className="text-xs font-medium text-foreground cursor-pointer">
                  Half-day request (0.5 day)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Reason / Handover Notes</label>
                <Textarea
                  placeholder="Provide context for your team lead..."
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
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
                  onClick={() => setShowApplyModal(false)}
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
