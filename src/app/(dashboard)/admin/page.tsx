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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Employee, LeaveRequest } from "@/types/hrms";

const departmentData = [
  { name: "Engineering", value: 3, color: "#7C3AED" },
  { name: "People & HR", value: 2, color: "#F97316" },
  { name: "Executive", value: 1, color: "#10B981" },
  { name: "Backend Core", value: 1, color: "#3B82F6" },
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

  const handleOpenActionModal = (req: LeaveRequest, type: "APPROVE" | "REJECT") => {
    setSelectedRequest(req);
    setActionType(type);
    setReviewRemarks(
      type === "APPROVE"
        ? "Approved. Ensure task handover is aligned."
        : "Declined due to ongoing sprint delivery deadline."
    );
  };

  const handleConfirmAction = () => {
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="orange" className="text-xs px-2 py-0.5 font-semibold">
              HR & Organization Admin
            </Badge>
            <span className="text-xs text-muted-foreground">Acme Corp Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1 flex items-center gap-2">
            Admin Command Center
            <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Workforce health, department analytics, employee records, and pending leave approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 border-purple-500/30">
            <Link href="/profile">
              <Eye className="h-3.5 w-3.5" />
              View as Employee
            </Link>
          </Button>
          <Button asChild variant="purple" size="sm" className="rounded-xl text-xs gap-1.5 shadow-md">
            <Link href="/leaves">
              <Calendar className="h-3.5 w-3.5" />
              Manage All Leaves
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Headcount"
          value={employees.length}
          subtitle="All active employee records"
          icon={Users}
          trend={{ value: "+14% YoY", isPositive: true }}
          variant="purple"
        />
        <StatCard
          title="Present Today"
          value={`${employees.length - 1} / ${employees.length}`}
          subtitle="92% attendance rate"
          icon={CheckCircle2}
          trend={{ value: "Normal", isPositive: true }}
          variant="green"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves.length}
          subtitle="Action required by managers"
          icon={Clock}
          trend={{ value: `${pendingLeaves.length} requests`, isPositive: pendingLeaves.length === 0 }}
          variant="orange"
        />
        <StatCard
          title="Monthly Payroll"
          value={formatINR(employees.reduce((acc, e) => acc + (e.salary_structure?.gross_earnings || 0), 0))}
          subtitle="August 2026 disbursement"
          icon={FileSpreadsheet}
          trend={{ value: "On schedule", isPositive: true }}
          variant="blue"
        />
      </div>

      {/* Pending Approvals Section */}
      <Card className="border border-purple-500/30 bg-card/90 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-foreground">
                Pending Leave Approvals
              </CardTitle>
              {pendingLeaves.length > 0 && (
                <Badge variant="orange" className="text-xs">
                  {pendingLeaves.length} requires action
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Review and act on employee leave applications with custom feedback
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {pendingLeaves.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              🎉 No pending leave requests. All applications have been processed!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.map((req) => (
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
                      {formatDate(req.start_date)} – {formatDate(req.end_date)}
                    </TableCell>
                    <TableCell className="text-xs font-bold">
                      {req.total_days} day(s)
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {req.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenActionModal(req, "APPROVE")}
                          className="h-8 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30 gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenActionModal(req, "REJECT")}
                          className="h-8 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-500/10 border-red-500/30 gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
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

      {/* Headcount Distribution Chart & Org Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown Chart */}
        <Card className="border border-border/70 rounded-2xl shadow-sm overflow-hidden lg:col-span-1">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-base font-semibold">Headcount by Department</CardTitle>
            <CardDescription className="text-xs">Distribution across Acme Corp</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "rgba(18, 18, 24, 0.95)",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {departmentData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="truncate">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Searchable Employee Directory Table */}
        <Card className="border border-border/70 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
          <CardHeader className="p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Employee Directory</CardTitle>
                <CardDescription className="text-xs">
                  Search & inspect full records ({filteredEmployees.length} total)
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs w-36 sm:w-44 rounded-xl"
                  />
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-8 rounded-xl border border-input bg-background px-2 text-xs focus-visible:ring-1"
                >
                  <option value="ALL">All Depts</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">People (HR)</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={emp.avatar_url} />
                          <AvatarFallback>{emp.first_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-xs text-foreground">
                            {emp.display_name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{emp.work_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {emp.department_name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {emp.location_name.split(" ")[0]}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedEmployee(emp)}
                        className="h-7 px-2 text-xs text-purple-600 dark:text-purple-400 font-semibold"
                      >
                        <Link href="/profile">View Profile</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Review Remarks Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-md glass-panel">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                {actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedRequest.employee_name} ({selectedRequest.leave_type} • {selectedRequest.total_days} days)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
                <span className="font-semibold text-foreground">Employee Reason:</span>
                <p className="text-muted-foreground">{selectedRequest.reason}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reviewer Comments / Remarks:
                </label>
                <Textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Enter approval note or rejection feedback..."
                  className="text-xs rounded-xl"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
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
                onClick={handleConfirmAction}
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
