"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  UserCheck,
  UserX,
  Eye,
  Check,
  X,
  MessageSquare,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  BrainCircuit,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatINR, formatDate } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Employee, LeaveRequest } from "@/types/hrms";

const departmentData = [
  { name: "Core Platform", value: 1, color: "#7C3AED" },
  { name: "Product Design", value: 1, color: "#F97316" },
  { name: "People Operations", value: 1, color: "#10B981" },
  { name: "Infrastructure", value: 1, color: "#3B82F6" },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const {
    employees,
    leaveRequests,
    approveLeave,
    rejectLeave,
    setSelectedEmployee,
  } = useHRMS();

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState("");

  const pendingLeaves = leaveRequests.filter((r) => r.status === "PENDING");

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.work_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      departmentFilter === "ALL" || emp.department_name.includes(departmentFilter);

    return matchesSearch && matchesDept;
  });

  const handleActionConfirm = () => {
    if (!selectedRequest || !actionType) return;
    if (actionType === "APPROVE") {
      approveLeave(selectedRequest.id, reviewRemarks);
    } else {
      rejectLeave(selectedRequest.id, reviewRemarks);
    }
    setSelectedRequest(null);
    setActionType(null);
    setReviewRemarks("");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="orange" className="text-xs px-2.5 py-0.5 font-semibold">
              Executive Console
            </Badge>
            <Badge variant="purple" className="text-xs">
              Super Admin / HR Lead
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1 flex items-center gap-2">
            Admin & Workforce Command Center
            <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time organizational headcount, pending approval queues, and policy guardrails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" className="rounded-xl text-xs sm:text-sm font-semibold gap-2">
            <Link href="/leaves">
              <BrainCircuit className="h-4 w-4 text-purple-600" />
              Policy Engine
            </Link>
          </Button>
          <Button asChild variant="purple" className="rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md">
            <Link href="/profile">
              <Sparkles className="h-4 w-4" />
              Admin Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Headcount"
          value={employees.length}
          icon={Users}
          description="100% full-time permanent workforce"
          trend={{ value: "+12.5%", isPositive: true }}
          variant="purple"
        />

        <StatCard
          title="Present Today"
          value={employees.length}
          icon={CheckCircle2}
          description="100% on-time attendance today"
          variant="success"
        />

        <StatCard
          title="Pending Approvals"
          value={pendingLeaves.length}
          icon={Clock}
          description={pendingLeaves.length > 0 ? "Requires manager sign-off" : "All queues cleared"}
          variant={pendingLeaves.length > 0 ? "orange" : "default"}
        />

        <StatCard
          title="Monthly Payroll CTC"
          value={formatINR(216000)}
          icon={Building2}
          description="FY 2026-27 active run disbursed"
          variant="purple"
        />
      </div>

      {/* Pending Leave Approvals Queue */}
      <Card className="border border-purple-500/30 rounded-3xl shadow-sm overflow-hidden bg-gradient-to-r from-purple-950/15 via-card to-transparent">
        <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Pending Leave Approvals Queue
              </CardTitle>
              {pendingLeaves.length > 0 && (
                <Badge variant="orange" className="text-xs">
                  {pendingLeaves.length} Action Required
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs mt-0.5">
              Automated policy checks are pre-evaluated. One-click approve or reject with custom audit remarks.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {pendingLeaves.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-80" />
              <p className="font-semibold text-foreground">All Approvals Clear</p>
              <p className="text-[11px] max-w-sm">
                No leave requests are currently pending manager review.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>AI Policy Outcome</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 ring-1 ring-purple-500/20">
                          <AvatarImage src={req.employee_avatar} />
                          <AvatarFallback className="text-[10px]">DS</AvatarFallback>
                        </Avatar>
                        <span>{req.employee_name}</span>
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
                      {req.days_count} Days
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate" title={req.reason}>
                      {req.reason}
                    </TableCell>

                    <TableCell>
                      <Badge variant="success" className="text-[9px]">
                        ✓ All Checks Passed (Approve)
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionType("APPROVE");
                          }}
                          className="h-7 text-xs rounded-lg gap-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 font-semibold"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionType("REJECT");
                          }}
                          className="h-7 text-xs rounded-lg gap-1 border-red-500/40 text-red-600 hover:bg-red-50 font-semibold"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Employee Directory Table & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Employee Directory */}
        <Card className="lg:col-span-2 border border-border/80 rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Employee Directory
              </CardTitle>
              <CardDescription className="text-xs">
                Searchable directory of verified organization members
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search name, role, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-xl w-48"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role & Band</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 ring-1 ring-purple-500/20">
                          <AvatarImage src={emp.avatar_url} />
                          <AvatarFallback className="text-[10px]">DS</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{emp.display_name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{emp.employee_code}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      {emp.job_title}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {emp.department_name}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {emp.location_name?.split(" ")[0] || "Bengaluru"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="success" className="text-[9px]">
                        Active
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs rounded-lg gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400"
                      >
                        <Link href="/profile">
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right 1 Col: Department Headcount Distribution Donut */}
        <Card className="border border-border/80 rounded-3xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              Department Breakdown
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Organizational headcount distribution
            </CardDescription>

            <div className="h-48 w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
            {departmentData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-bold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Review Remarks Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
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
                Add official manager remarks to record in the audit trace
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <p><strong>Employee:</strong> {selectedRequest.employee_name}</p>
                <p><strong>Type & Days:</strong> {selectedRequest.leave_type} ({selectedRequest.days_count} days)</p>
                <p><strong>Reason:</strong> "{selectedRequest.reason}"</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Manager Decision Remarks</label>
                <Textarea
                  placeholder={actionType === "APPROVE" ? "Approved as requested." : "Please specify reason for rejection..."}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="text-xs rounded-xl"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
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
