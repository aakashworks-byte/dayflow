"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  AlertCircle,
  Filter,
  Check,
  X,
  MessageSquare,
  BrainCircuit,
  ShieldCheck,
  Info,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { LeaveRequest, LeaveType } from "@/types/hrms";

export default function LeavesPage() {
  const { user, isHrAdmin, isManager } = useAuth();
  const {
    leaveBalances,
    leaveRequests,
    applyLeave,
    approveLeave,
    rejectLeave,
  } = useHRMS();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [selectedTraceRequest, setSelectedTraceRequest] = useState<LeaveRequest | null>(null);

  const [formData, setFormData] = useState({
    leave_type: "CASUAL" as LeaveType,
    start_date: "2026-08-28",
    end_date: "2026-08-29",
    total_days: 2,
    is_half_day: false,
    reason: "Personal family commitment and long weekend recharge.",
  });

  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING" | "REJECTED">("ALL");
  const [selectedReqForAction, setSelectedReqForAction] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [actionRemarks, setActionRemarks] = useState("");

  const userBalance = (user && leaveBalances[user.id]) || {
    casual: { total: 12, used: 3, remaining: 9 },
    sick: { total: 12, used: 2, remaining: 10 },
    privilege: { total: 18, used: 4, remaining: 14 },
    unpaid: { total: 10, used: 0, remaining: 10 },
  };

  const handleDateChange = (start: string, end: string, isHalf: boolean) => {
    if (isHalf) {
      setFormData((prev) => ({ ...prev, start_date: start, end_date: start, total_days: 0.5 }));
      return;
    }
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setFormData((prev) => ({
      ...prev,
      start_date: start,
      end_date: end,
      total_days: isNaN(diffDays) || diffDays < 1 ? 1 : diffDays,
    }));
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) return;

    applyLeave({
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      is_half_day: formData.is_half_day,
      days_count: formData.total_days,
    });

    setShowApplyModal(false);
    setFormData({
      leave_type: "CASUAL",
      start_date: "2026-08-28",
      end_date: "2026-08-29",
      total_days: 2,
      is_half_day: false,
      reason: "",
    });
  };

  const handleActionConfirm = () => {
    if (!selectedReqForAction || !actionType) return;
    if (actionType === "APPROVE") {
      approveLeave(selectedReqForAction.id, actionRemarks);
    } else {
      rejectLeave(selectedReqForAction.id, actionRemarks);
    }
    setSelectedReqForAction(null);
    setActionType(null);
    setActionRemarks("");
  };

  const filteredRequests = leaveRequests.filter((req) => {
    if (statusFilter === "ALL") return true;
    return req.status === statusFilter;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" className="text-xs px-2.5 py-0.5 font-semibold">
              Time & Absence Management
            </Badge>
            <Badge variant="outline" className="text-xs">
              FY 2026–27
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1 flex items-center gap-2">
            Leaves & Policy Intelligence
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time quota tracking, AI automated policy verification, and transparent decision audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => {
              setSelectedTraceRequest(leaveRequests[0] || null);
              setShowTraceModal(true);
            }}
            variant="outline"
            className="rounded-xl text-xs sm:text-sm font-semibold gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400"
          >
            <BrainCircuit className="h-4 w-4" />
            Decision Trace
          </Button>

          <Button
            onClick={() => setShowApplyModal(true)}
            variant="purple"
            className="rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md shadow-purple-600/25"
          >
            <PlusCircle className="h-4 w-4" />
            Smart Leave Planner
          </Button>
        </div>
      </div>

      {/* 4 Leave Balances Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid / Privilege Leave */}
        <Card className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Paid Leave (PL)</span>
            <Badge variant="purple" className="text-[10px]">
              Annual
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{userBalance.privilege.remaining}</span>
            <span className="text-xs text-muted-foreground">/ {userBalance.privilege.total} days left</span>
          </div>
          <Progress value={(userBalance.privilege.remaining / userBalance.privilege.total) * 100} className="h-2 bg-purple-200 dark:bg-purple-950" />
          <span className="text-[10.5px] text-muted-foreground block">{userBalance.privilege.used} days utilized this year</span>
        </Card>

        {/* Sick Leave */}
        <Card className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">Sick Leave (SL)</span>
            <Badge variant="orange" className="text-[10px]">
              Medical
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{userBalance.sick.remaining}</span>
            <span className="text-xs text-muted-foreground">/ {userBalance.sick.total} days left</span>
          </div>
          <Progress value={(userBalance.sick.remaining / userBalance.sick.total) * 100} className="h-2 bg-orange-200 dark:bg-orange-950" />
          <span className="text-[10.5px] text-muted-foreground block">{userBalance.sick.used} days utilized (Requires certificate for &gt;2 days)</span>
        </Card>

        {/* Casual Leave */}
        <Card className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Casual Leave (CL)</span>
            <Badge variant="success" className="text-[10px]">
              Standard
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{userBalance.casual.remaining}</span>
            <span className="text-xs text-muted-foreground">/ {userBalance.casual.total} days left</span>
          </div>
          <Progress value={(userBalance.casual.remaining / userBalance.casual.total) * 100} className="h-2 bg-emerald-200 dark:bg-emerald-950" />
          <span className="text-[10.5px] text-muted-foreground block">{userBalance.casual.used} days used for short personal errands</span>
        </Card>

        {/* Unpaid / LWP */}
        <Card className="rounded-2xl border border-border/70 bg-card p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Unpaid Leave (LWP)</span>
            <Badge variant="outline" className="text-[10px]">
              Flexible
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{userBalance.unpaid.remaining}</span>
            <span className="text-xs text-muted-foreground">/ {userBalance.unpaid.total} max days</span>
          </div>
          <Progress value={100} className="h-2 bg-muted" />
          <span className="text-[10.5px] text-muted-foreground block">Subject to line manager discretion</span>
        </Card>
      </div>

      {/* Priority Feature: Smart Leave Planner Spotlight Card */}
      <Card className="border border-purple-500/30 rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-purple-950/20 via-card to-indigo-950/10 backdrop-blur-xl">
        <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Smart Leave Planner & Policy Intelligence Engine
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Automated compliance verification evaluates notice periods, minimum team coverage, and holiday adjacencies.
            </CardDescription>
          </div>

          <Badge variant="purple" className="text-xs w-fit">
            AI Policy Engine v2.4 Active
          </Badge>
        </CardHeader>

        <CardContent className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left 7 Cols: Policy Checks Summary */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Automated Policy Checks (Next Planned Time-Off: 28 Aug – 29 Aug)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Notice Period Rule</span>
                  <p className="text-[11px] text-muted-foreground">7+ days notice provided (Rule 104 passed).</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Quota Entitlement</span>
                  <p className="text-[11px] text-muted-foreground">9 Casual Leave days available (Quota passed).</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Team Minimum Coverage</span>
                  <p className="text-[11px] text-muted-foreground">94% Core Engineering team active.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Holiday Alignment</span>
                  <p className="text-[11px] text-muted-foreground">Connected with Raksha Bandhan holiday.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: AI Recommendation & Decision Trace Trigger */}
          <div className="lg:col-span-5 rounded-2xl border border-purple-500/40 bg-purple-500/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" />
                AI Recommendation:
              </span>
              <Badge variant="success" className="text-[10px]">
                RECOMMEND APPROVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              "Zero project blockers detected. Engineering sprint deliverables are on track. Recommended for fast-track 1-click approval."
            </p>
            <div className="pt-1 flex items-center justify-between">
              <Button
                size="sm"
                variant="purple"
                onClick={() => {
                  setSelectedTraceRequest(leaveRequests[0] || null);
                  setShowTraceModal(true);
                }}
                className="w-full text-xs font-semibold rounded-xl gap-1.5 shadow-sm"
              >
                <BrainCircuit className="h-3.5 w-3.5" />
                Inspect Full Decision Trace & Evidence
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests History Table */}
      <Card className="border border-border/80 rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Leave Requests & Approvals Audit
            </CardTitle>
            <CardDescription className="text-xs">
              Full record of applied time-off, automated policy validations, and manager remarks
            </CardDescription>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60">
            {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === filter
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason / Handover</TableHead>
                <TableHead>Policy Trace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-semibold text-xs text-foreground">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 ring-1 ring-purple-500/20">
                        <AvatarImage src={req.employee_avatar} />
                        <AvatarFallback className="text-[10px]">DS</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{req.employee_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{req.employee_code}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="purple" className="text-[10px]">
                      {req.leave_type}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {formatDate(req.start_date)} - {formatDate(req.end_date)}
                  </TableCell>

                  <TableCell className="text-xs font-bold text-foreground">
                    {req.days_count} {req.days_count === 1 ? "day" : "days"}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={req.reason}>
                    {req.reason}
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedTraceRequest(req);
                        setShowTraceModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      <BrainCircuit className="h-3.5 w-3.5" />
                      View Trace
                    </button>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        req.status === "APPROVED"
                          ? "success"
                          : req.status === "REJECTED"
                          ? "destructive"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {req.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {req.status === "PENDING" && (isHrAdmin || isManager) ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReqForAction(req);
                            setActionType("APPROVE");
                          }}
                          className="h-7 text-xs rounded-lg gap-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReqForAction(req);
                            setActionType("REJECT");
                          }}
                          className="h-7 text-xs rounded-lg gap-1 border-red-500/40 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        {req.approver_remarks || "Verified"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Smart Leave Planner Form Modal */}
      {showApplyModal && (
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-600" />
                Smart Leave Planner (Dhruv Singh)
              </DialogTitle>
              <DialogDescription className="text-xs">
                AI automated validation checks rules and team coverage before routing to manager.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleApplySubmit} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Leave Category</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value as any })}
                  className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1"
                >
                  <option value="CASUAL">Casual Leave (CL) • 9 days remaining</option>
                  <option value="PAID">Paid / Privilege Leave (PL) • 14 days remaining</option>
                  <option value="SICK">Sick / Medical Leave (SL) • 10 days remaining</option>
                  <option value="UNPAID">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleDateChange(e.target.value, formData.end_date, formData.is_half_day)}
                    className="text-xs h-9 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleDateChange(formData.start_date, e.target.value, formData.is_half_day)}
                    className="text-xs h-9 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="half-day-toggle"
                    checked={formData.is_half_day}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, is_half_day: e.target.checked }));
                      handleDateChange(formData.start_date, formData.end_date, e.target.checked);
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="half-day-toggle" className="font-semibold text-foreground cursor-pointer">
                    Half-day request (0.5 day)
                  </label>
                </div>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                  {formData.total_days} {formData.total_days === 1 ? "day" : "days"}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Reason & Handover Notes</label>
                <Textarea
                  placeholder="Provide context for your team lead..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Decision Trace & Policy Intelligence Modal */}
      {showTraceModal && (
        <Dialog open={showTraceModal} onOpenChange={setShowTraceModal}>
          <DialogContent className="max-w-2xl glass-panel p-6">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                    Decision Trace — Policy Intelligence Engine
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    REQUEST → POLICY EVALUATION → EVIDENCE AUDIT → AI RECOMMENDATION → HUMAN DECISION
                  </DialogDescription>
                </div>
                <Badge variant="purple" className="text-xs">
                  AI + Human Guardrails
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Core Banner */}
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  Employee: {selectedTraceRequest?.employee_name || "Dhruv Singh"} ({selectedTraceRequest?.employee_code || "EMP-001"})
                </span>
                <span className="font-mono text-muted-foreground">
                  {selectedTraceRequest?.leave_type || "PAID"} • {selectedTraceRequest?.days_count || 2} Days
                </span>
              </div>

              {/* Visual 5-Step Timeline */}
              <div className="space-y-3 relative pl-6 border-l-2 border-purple-500/40 ml-2">
                {/* Step 1: Request Ingestion */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    1
                  </div>
                  <span className="font-bold text-foreground block">Request Ingestion</span>
                  <p className="text-[11px] text-muted-foreground">
                    Employee submitted {selectedTraceRequest?.days_count || 2} day(s) request from {selectedTraceRequest?.start_date || "2026-08-10"} to {selectedTraceRequest?.end_date || "2026-08-12"}.
                  </p>
                </div>

                {/* Step 2: Policy Rule Evaluation */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    2
                  </div>
                  <span className="font-bold text-foreground block">Automated Rule Engine Verification</span>
                  <div className="grid grid-cols-2 gap-2 mt-1.5 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                      ✓ Rule 101: Quota Available (14 days remaining)
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                      ✓ Rule 104: 7+ Days Notice Period Met
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                      ✓ Rule 202: Minimum 85% Team Coverage Met (94% active)
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                      ⚠ Notice: Adjacent to public holiday
                    </div>
                  </div>
                </div>

                {/* Step 3: Evidence & Audit */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    3
                  </div>
                  <span className="font-bold text-foreground block">Evidence Snapshot</span>
                  <p className="text-[11px] text-muted-foreground">
                    Tenant: NMIT (Nitte Meenakshi Institute of Technology) • Org ID: 11111111-1111 • Zero conflicting blocker meetings found on calendar.
                  </p>
                </div>

                {/* Step 4: AI Recommendation */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    4
                  </div>
                  <span className="font-bold text-foreground block">AI Policy Recommendation</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 mt-1">
                    <strong>RECOMMENDATION: APPROVE</strong> — Full policy compliance. No service interruptions expected.
                  </div>
                </div>

                {/* Step 5: Human Decision */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    5
                  </div>
                  <span className="font-bold text-foreground block">Final Human Decision</span>
                  <p className="text-[11px] text-muted-foreground">
                    Status: <strong>{selectedTraceRequest?.status || "APPROVED"}</strong> • Decision By: {selectedTraceRequest?.approved_by_name || "Executive Board"}.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 text-[10.5px] text-muted-foreground italic text-center border border-border/50">
                🛡️ AI explains and recommends. Human manager retains final sign-off.
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="purple"
                size="sm"
                onClick={() => setShowTraceModal(false)}
                className="rounded-xl text-xs"
              >
                Close Trace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approval / Rejection Remarks Modal */}
      {selectedReqForAction && (
        <Dialog open={!!selectedReqForAction} onOpenChange={() => setSelectedReqForAction(null)}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {actionType === "APPROVE" ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
                {actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add official manager remarks before finalizing decision
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <p><strong>Employee:</strong> {selectedReqForAction.employee_name}</p>
                <p><strong>Type & Days:</strong> {selectedReqForAction.leave_type} ({selectedReqForAction.days_count} days)</p>
                <p><strong>Reason:</strong> "{selectedReqForAction.reason}"</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Approver Remarks</label>
                <Textarea
                  placeholder={actionType === "APPROVE" ? "Approved as requested." : "Please specify reason for rejection..."}
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  className="text-xs rounded-xl"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReqForAction(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "APPROVE" ? "purple" : "destructive"}
                size="sm"
                onClick={handleActionConfirm}
                className="rounded-xl text-xs font-semibold shadow-md"
              >
                Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
