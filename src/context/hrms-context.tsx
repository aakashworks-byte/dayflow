"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Employee,
  AttendanceRecord,
  LeaveBalance,
  LeaveRequest,
  Payslip,
  NotificationItem,
  ActivityFeedItem,
} from "@/types/hrms";
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_BALANCES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_FEED,
  INITIAL_PAYSLIPS,
  generateMonthAttendance,
} from "@/lib/mock-data";
import { useAuth } from "./auth-context";
import { useToast } from "@/components/ui/use-toast";
import confetti from "canvas-confetti";

interface HRMSContextType {
  // Attendance
  isCheckedIn: boolean;
  checkInTime: Date | null;
  workingSeconds: number;
  toggleCheckIn: () => void;
  attendanceRecords: AttendanceRecord[];
  regularizeAttendance: (recordId: string, notes: string) => void;

  // Leaves
  leaveBalances: Record<string, LeaveBalance>;
  leaveRequests: LeaveRequest[];
  applyLeave: (data: {
    leave_type: LeaveRequest["leave_type"];
    start_date: string;
    end_date: string;
    total_days: number;
    is_half_day?: boolean;
    reason: string;
  }) => void;
  approveLeave: (requestId: string, remarks?: string) => void;
  rejectLeave: (requestId: string, remarks?: string) => void;

  // Employees & Directory
  employees: Employee[];
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;
  updateEmployeeProfile: (updated: Partial<Employee>) => void;
  uploadDocument: (doc: { name: string; category: any; size_kb: number }) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Activity Feed & Payslips
  activityFeed: ActivityFeedItem[];
  payslips: Payslip[];
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

export function HRMSProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Attendance state
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(true);
  const [checkInTime, setCheckInTime] = useState<Date | null>(new Date("2026-08-22T09:02:00.000Z"));
  const [workingSeconds, setWorkingSeconds] = useState<number>(6 * 3600 + 14 * 60); // 6h 14m
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    generateMonthAttendance()
  );

  // Leave state
  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(INITIAL_LEAVE_BALANCES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);

  // Employees state
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Notifications & Feed
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(INITIAL_ACTIVITY_FEED);
  const [payslips] = useState<Payslip[]>(INITIAL_PAYSLIPS);

  // Attendance live timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setWorkingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  // Handle Check-in / Check-out toggle
  const toggleCheckIn = () => {
    if (isCheckedIn) {
      // Check Out
      setIsCheckedIn(false);
      const now = new Date();
      toast({
        title: "Checked Out Successfully",
        description: `Your workday session ended at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Total worked: ${(workingSeconds / 3600).toFixed(1)} hrs.`,
        variant: "purple",
      });

      // Update today's record
      setAttendanceRecords((prev) =>
        prev.map((r) =>
          r.date === "2026-08-22"
            ? {
                ...r,
                check_out: now.toISOString(),
                duration_hours: Number((workingSeconds / 3600).toFixed(1)),
              }
            : r
        )
      );

      // Add to activity feed
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          actor_name: user?.display_name || "Employee",
          actor_avatar: user?.avatar_url,
          action: "checked out",
          target: "Workday session concluded",
          timestamp: "Just now",
          type: "ATTENDANCE",
        },
        ...prev,
      ]);
    } else {
      // Check In
      const now = new Date();
      setIsCheckedIn(true);
      setCheckInTime(now);
      toast({
        title: "Checked In Successfully! 👋",
        description: `Welcome! Checked in at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} from ${user?.location_name || "Office"}.`,
        variant: "success",
      });

      // Add to activity feed
      setActivityFeed((prev) => [
        {
          id: `act-${Date.now()}`,
          actor_name: user?.display_name || "Employee",
          actor_avatar: user?.avatar_url,
          action: "checked in",
          target: user?.location_name || "Office Hub",
          timestamp: "Just now",
          type: "ATTENDANCE",
        },
        ...prev,
      ]);
    }
  };

  const regularizeAttendance = (recordId: string, notes: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: "PRESENT",
              is_regularized: true,
              notes: `Regularized: ${notes}`,
              duration_hours: 8.5,
            }
          : r
      )
    );
    toast({
      title: "Attendance Regularization Submitted",
      description: "Your request has been approved and your record updated.",
      variant: "success",
    });
  };

  // Leave Actions
  const applyLeave = (data: {
    leave_type: LeaveRequest["leave_type"];
    start_date: string;
    end_date: string;
    total_days: number;
    is_half_day?: boolean;
    reason: string;
  }) => {
    if (!user) return;

    const newRequest: LeaveRequest = {
      id: `lr-${Date.now()}`,
      employee_id: user.id,
      employee_name: user.display_name,
      employee_code: user.employee_code,
      department_name: user.department_name,
      avatar_url: user.avatar_url,
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      total_days: data.total_days,
      is_half_day: data.is_half_day,
      reason: data.reason,
      status: "PENDING",
      applied_at: new Date().toISOString(),
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);

    // Update balances temporarily
    const balanceKey = data.leave_type.toLowerCase() as "casual" | "sick" | "privilege" | "unpaid";
    setLeaveBalances((prev) => {
      const userBalance = prev[user.id] || {
        casual: { total: 12, used: 0, remaining: 12 },
        sick: { total: 10, used: 0, remaining: 10 },
        privilege: { total: 18, used: 0, remaining: 18 },
        unpaid: { total: 30, used: 0, remaining: 30 },
      };

      return {
        ...prev,
        [user.id]: {
          ...userBalance,
          [balanceKey]: {
            ...userBalance[balanceKey],
            used: userBalance[balanceKey].used + data.total_days,
            remaining: Math.max(0, userBalance[balanceKey].remaining - data.total_days),
          },
        },
      };
    });

    // Notify user
    toast({
      title: "Leave Application Submitted 🚀",
      description: `Your ${data.leave_type.toLowerCase()} leave request for ${data.total_days} day(s) was submitted to ${user.manager_name || "Manager"} for approval.`,
      variant: "purple",
    });

    // Add activity item
    setActivityFeed((prev) => [
      {
        id: `act-${Date.now()}`,
        actor_name: user.display_name,
        actor_avatar: user.avatar_url,
        action: `applied for ${data.leave_type.toLowerCase()} leave`,
        target: `${data.start_date} to ${data.end_date}`,
        timestamp: "Just now",
        type: "LEAVE",
      },
      ...prev,
    ]);
  };

  const approveLeave = (requestId: string, remarks?: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: "APPROVED",
            approved_by: user?.id,
            approved_by_name: user?.display_name || "Manager",
            approved_at: new Date().toISOString(),
            approver_remarks: remarks || "Approved as requested.",
          };
        }
        return req;
      })
    );

    const targetReq = leaveRequests.find((r) => r.id === requestId);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7C3AED", "#F97316", "#10B981"],
      });
    } catch {
      // ignore
    }

    toast({
      title: "Leave Request Approved ✅",
      description: `Leave for ${targetReq?.employee_name || "employee"} has been officially approved.`,
      variant: "success",
    });

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Leave Approved",
        message: `${user?.display_name || "Manager"} approved leave for ${targetReq?.employee_name} (${targetReq?.start_date}).`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "LEAVE",
      },
      ...prev,
    ]);
  };

  const rejectLeave = (requestId: string, remarks?: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: "REJECTED",
            approved_by: user?.id,
            approved_by_name: user?.display_name || "Manager",
            approved_at: new Date().toISOString(),
            approver_remarks: remarks || "Request declined due to critical team commitments.",
          };
        }
        return req;
      })
    );

    const targetReq = leaveRequests.find((r) => r.id === requestId);

    toast({
      title: "Leave Request Rejected",
      description: `Leave request for ${targetReq?.employee_name || "employee"} was declined.`,
      variant: "destructive",
    });
  };

  // Profile updates
  const updateEmployeeProfile = (updated: Partial<Employee>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updated };
    setEmployees((prev) =>
      prev.map((e) => (e.id === user.id ? { ...e, ...updated } : e))
    );
    toast({
      title: "Profile Updated ✨",
      description: "Your personal details and bio were updated successfully.",
      variant: "purple",
    });
  };

  const uploadDocument = (doc: { name: string; category: any; size_kb: number }) => {
    if (!user) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: doc.name,
      type: "PDF" as const,
      category: doc.category,
      size_kb: doc.size_kb,
      uploaded_at: new Date().toISOString().split("T")[0],
      file_url: "#",
    };

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === user.id
          ? { ...e, documents: [...(e.documents || []), newDoc] }
          : e
      )
    );

    toast({
      title: "Document Uploaded Successfully 📄",
      description: `${doc.name} has been securely added to your employee vault.`,
      variant: "success",
    });
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: "All Notifications Marked as Read",
      variant: "purple",
    });
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <HRMSContext.Provider
      value={{
        isCheckedIn,
        checkInTime,
        workingSeconds,
        toggleCheckIn,
        attendanceRecords,
        regularizeAttendance,
        leaveBalances,
        leaveRequests,
        applyLeave,
        approveLeave,
        rejectLeave,
        employees,
        selectedEmployee,
        setSelectedEmployee,
        updateEmployeeProfile,
        uploadDocument,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        activityFeed,
        payslips,
      }}
    >
      {children}
    </HRMSContext.Provider>
  );
}

export function useHRMS() {
  const context = useContext(HRMSContext);
  if (!context) {
    throw new Error("useHRMS must be used within an HRMSProvider");
  }
  return context;
}
