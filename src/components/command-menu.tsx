"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  LayoutDashboard,
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useHRMS } from "@/context/hrms-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { employees, setSelectedEmployee } = useHRMS();
  const { isHrAdmin } = useAuth();

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const filteredEmployees = employees.filter(
    (e) =>
      e.display_name.toLowerCase().includes(search.toLowerCase()) ||
      e.job_title.toLowerCase().includes(search.toLowerCase()) ||
      e.department_name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_code.toLowerCase().includes(search.toLowerCase())
  );

  const navigateTo = (path: string) => {
    router.push(path);
    onOpenChange(false);
  };

  const selectEmployee = (emp: any) => {
    setSelectedEmployee(emp);
    router.push("/profile");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden glass-panel border-purple-500/20">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Search className="h-4 w-4 text-purple-600" />
            Spotlight Command Center
          </DialogTitle>
          <div className="relative mt-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search employees..."
              className="h-12 bg-muted/40 text-sm pl-4 pr-10 rounded-xl focus-visible:ring-purple-500"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-4 pt-2 space-y-4">
          {/* Quick Navigation Pages */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
              Navigation
            </span>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <button
                onClick={() => navigateTo("/")}
                className="flex items-center gap-2.5 rounded-lg p-2.5 text-xs text-left hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-purple-600" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => navigateTo("/attendance")}
                className="flex items-center gap-2.5 rounded-lg p-2.5 text-xs text-left hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Attendance Logs</span>
              </button>
              <button
                onClick={() => navigateTo("/leaves")}
                className="flex items-center gap-2.5 rounded-lg p-2.5 text-xs text-left hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>Apply Leave</span>
              </button>
              <button
                onClick={() => navigateTo("/payroll")}
                className="flex items-center gap-2.5 rounded-lg p-2.5 text-xs text-left hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span>Salary & Payslip (₹)</span>
              </button>
              {isHrAdmin && (
                <button
                  onClick={() => navigateTo("/admin")}
                  className="flex items-center gap-2.5 rounded-lg p-2.5 text-xs text-left col-span-2 hover:bg-orange-500/10 hover:text-orange-600 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-orange-500" />
                  <span>Admin Command Center</span>
                </button>
              )}
            </div>
          </div>

          {/* Employees Search */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
              Employees Directory ({filteredEmployees.length})
            </span>
            <div className="mt-1.5 space-y-1">
              {filteredEmployees.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center">
                  No matching employees found for "{search}"
                </p>
              ) : (
                filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => selectEmployee(emp)}
                    className="w-full flex items-center justify-between rounded-xl p-2.5 hover:bg-muted/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={emp.avatar_url} />
                        <AvatarFallback>{emp.first_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">
                          {emp.display_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {emp.job_title} • {emp.department_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {emp.employee_code}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
