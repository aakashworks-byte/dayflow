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
  const [formData, setFormData] = useState({
    leave_type: "CASUAL" as LeaveType,
    start_date: "2026-08-28",
    end_date: "2026-08-29",
    total_days: 2,
    is_half_day: false,
    reason: "",
  });

  const [selectedReqForAction, setSelectedReqForAction] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [actionRemarks, setActionRemarks] = useState("");

  const userBalance = (user && leaveBalances[user.id]) || {
    casual: { total: 12, used: 4, remaining: 8 },
    sick: { total: 10, used: 2, remaining: 8 },
    privilege: { total: 18, used: 3, remaining: 15 },
    unpaid: { total: 30, used: 0, remaining: 30 },
  };

  // Calculate days difference whenever dates change
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
      total_days: formData.total_days,
      is_half_day: formData.is_half_day,
      reason: formData.reason,
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

  const handleConfirmReview = () => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending Approval</Badge>;
    }
  };

  const canReview = isHrAdmin || isManager;
  const myRequests = leaveRequests.filter((r) => r.employee_id === user?.id);
  const allTeamRequests = leaveRequests;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Leave & Time-Off Management
            <CalendarDays className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Apply for time off, view leave quotas, and track approvals seamlessly.
          </p>
        </div>

        <Button
          onClick={() => setShowApplyModal(true)}
          variant="purple"
          className="rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md"
        >
          <PlusCircle className="h-4 w-4" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balances Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Casual Leave */}
        <Card className="border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Casual Leave (CL)
              </span>
              <Badge variant="purple" className="text-[10px]">
                {userBalance.casual.remaining} Available
              </Badge>
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {userBalance.casual.remaining}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {userBalance.casual.total} Days
              </span>
            </div>
            <Progress
              value={(userBalance.casual.remaining / userBalance.casual.total) * 100}
              className="h-2"
            />
            <span className="text-[11px] text-muted-foreground block">
              {userBalance.casual.used} days utilized this fiscal year
            </span>
          </CardContent>
        </Card>

        {/* Sick Leave */}
        <Card className="border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Sick Leave (SL)
              </span>
              <Badge variant="success" className="text-[10px]">
                {userBalance.sick.remaining} Available
              </Badge>
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {userBalance.sick.remaining}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {userBalance.sick.total} Days
              </span>
            </div>
            <Progress
              value={(userBalance.sick.remaining / userBalance.sick.total) * 100}
              className="h-2"
              indicatorColor="bg-gradient-to-r from-emerald-500 to-teal-500"
            />
            <span className="text-[11px] text-muted-foreground block">
              {userBalance.sick.used} days utilized this fiscal year
            </span>
          </CardContent>
        </Card>

        {/* Privilege / Earned Leave */}
        <Card className="border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Privilege Leave (PL)
              </span>
              <Badge variant="warning" className="text-[10px]">
                {userBalance.privilege.remaining} Available
              </Badge>
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {userBalance.privilege.remaining}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {userBalance.privilege.total} Days
              </span>
            </div>
            <Progress
              value={(userBalance.privilege.remaining / userBalance.privilege.total) * 100}
              className="h-2"
              indicatorColor="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            <span className="text-[11px] text-muted-foreground block">
              {userBalance.privilege.used} days utilized this fiscal year
            </span>
          </CardContent>
        </Card>

        {/* Unpaid / LOP */}
        <Card className="border border-zinc-500/20 bg-gradient-to-br from-zinc-500/10 to-transparent rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Loss of Pay (LOP)
              </span>
              <Badge variant="outline" className="text-[10px]">
                0 Utilized
              </Badge>
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {userBalance.unpaid.remaining}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {userBalance.unpaid.total} Max Days
              </span>
            </div>
            <Progress value={100} className="h-2" indicatorColor="bg-zinc-400" />
            <span className="text-[11px] text-muted-foreground block">
              Discretionary subject to management approval
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Admin / Manager Queue for Team Requests (if Manager or HR) */}
      {canReview && (
        <Card className="border border-purple-500/30 bg-card/90 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-foreground">
                  Team Leave Requests Queue (Manager / HR View)
                </CardTitle>
                <Badge variant="purple" className="text-xs">
                  {allTeamRequests.length} total
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Review and approve or reject submissions from all direct reports
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTeamRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={req.avatar_url} />
                          <AvatarFallback>{req.employee_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-xs text-foreground">
                            {req.employee_name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {req.employee_code} • {req.department_name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="purple" className="text-[10px]">
                        {req.leave_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      <div>
                        {formatDate(req.start_date)} – {formatDate(req.end_date)}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-sans">
                        {req.total_days} day(s)
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {req.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      {req.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReqForAction(req);
                              setActionType("APPROVE");
                              setActionRemarks("Approved as requested.");
                            }}
                            className="h-7 px-2.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30 gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReqForAction(req);
                              setActionType("REJECT");
                              setActionRemarks("Declined due to project deliverable.");
                            }}
                            className="h-7 px-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-500/10 border-red-500/30 gap-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {req.approver_remarks || "Processed"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Employee's Own Leave History Table */}
      <Card className="border border-border/70 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold">My Leave Application History</CardTitle>
          <CardDescription className="text-xs">
            Past and current leave requests submitted by you
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {myRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              You have not submitted any leave applications yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approver Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Badge variant="purple" className="text-[10px]">
                        {req.leave_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {formatDate(req.start_date)} – {formatDate(req.end_date)}
                    </TableCell>
                    <TableCell className="text-xs font-bold">
                      {req.total_days} day(s) {req.is_half_day ? "(Half Day)" : ""}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {req.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {req.approver_remarks || (req.status === "PENDING" ? "Awaiting manager review" : "—")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Apply for Leave
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit your time-off request for manager approval
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleApplySubmit} className="space-y-3.5 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Leave Type</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value as LeaveType })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="CASUAL">Casual Leave (CL) - {userBalance.casual.remaining} remaining</option>
                  <option value="SICK">Sick Leave (SL) - {userBalance.sick.remaining} remaining</option>
                  <option value="PRIVILEGE">Privilege / Paid Leave (PL) - {userBalance.privilege.remaining} remaining</option>
                  <option value="UNPAID">Loss of Pay (LOP / Unpaid)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleDateChange(e.target.value, formData.end_date, formData.is_half_day)}
                    className="h-10 text-xs rounded-xl font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleDateChange(formData.start_date, e.target.value, formData.is_half_day)}
                    className="h-10 text-xs rounded-xl font-mono"
                    disabled={formData.is_half_day}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="halfDayToggle"
                    checked={formData.is_half_day}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData({ ...formData, is_half_day: checked });
                      handleDateChange(formData.start_date, formData.end_date, checked);
                    }}
                    className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                  />
                  <label htmlFor="halfDayToggle" className="text-xs font-medium cursor-pointer">
                    Half-day leave
                  </label>
                </div>
                <Badge variant="purple" className="text-xs font-bold">
                  Total: {formData.total_days} Day(s)
                </Badge>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Reason / Remarks</label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide details about your leave..."
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
                <Button type="submit" variant="purple" size="sm" className="rounded-xl text-xs font-semibold">
                  Submit Leave Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Modal */}
      {selectedReqForAction && (
        <Dialog open={!!selectedReqForAction} onOpenChange={() => setSelectedReqForAction(null)}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                {actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedReqForAction.employee_name} ({selectedReqForAction.leave_type} • {selectedReqForAction.total_days} days)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
                <span className="font-semibold text-foreground">Employee Reason:</span>
                <p className="text-muted-foreground">{selectedReqForAction.reason}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Manager Remarks / Comment:
                </label>
                <Textarea
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  className="text-xs rounded-xl"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
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
                onClick={handleConfirmReview}
                className="rounded-xl text-xs font-semibold"
              >
                {actionType === "APPROVE" ? "Confirm Approval" : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
