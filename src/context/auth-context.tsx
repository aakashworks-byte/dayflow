"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Employee, Role } from "@/types/hrms";
import { INITIAL_EMPLOYEES } from "@/lib/mock-data";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: Employee | null;
  role: Role;
  isLoading: boolean;
  login: (email: string, role?: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
  switchUser: (employeeId: string) => void;
  isHrAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isSuperAdmin: boolean;
  availableUsers: Employee[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to David Chen (Employee) for consistent server/client initial render
  const [user, setUser] = useState<Employee | null>(INITIAL_EMPLOYEES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Try to load saved user session if exists
    try {
      const savedUserId = localStorage.getItem("dayflow_active_user_id");
      if (savedUserId) {
        const found = INITIAL_EMPLOYEES.find((e) => e.id === savedUserId);
        if (found) {
          setUser(found);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const login = async (email: string, customRole?: Role) => {
    setIsLoading(true);
    try {
      // Find matching employee by work_email or personal_email
      let matched = INITIAL_EMPLOYEES.find(
        (e) => e.work_email.toLowerCase() === email.toLowerCase() || e.personal_email?.toLowerCase() === email.toLowerCase()
      );

      if (!matched && customRole) {
        matched = INITIAL_EMPLOYEES.find((e) => e.role === customRole);
      }

      if (!matched) {
        // Fallback to first employee
        matched = INITIAL_EMPLOYEES[0];
      }

      setUser(matched);
      localStorage.setItem("dayflow_active_user_id", matched.id);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: "Failed to sign in. Please check your credentials." };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("dayflow_active_user_id");
    } catch {}
    setUser(INITIAL_EMPLOYEES[0]);
    router.push("/login");
  };

  const switchRole = (newRole: Role) => {
    const matched = INITIAL_EMPLOYEES.find((e) => e.role === newRole) || INITIAL_EMPLOYEES[0];
    setUser(matched);
    try {
      localStorage.setItem("dayflow_active_user_id", matched.id);
    } catch {}
  };

  const switchUser = (employeeId: string) => {
    const matched = INITIAL_EMPLOYEES.find((e) => e.id === employeeId);
    if (matched) {
      setUser(matched);
      try {
        localStorage.setItem("dayflow_active_user_id", matched.id);
      } catch {}
    }
  };

  const currentRole = user?.role || "EMPLOYEE";
  const isHrAdmin = currentRole === "HR_ADMIN" || currentRole === "SUPER_ADMIN";
  const isManager = currentRole === "LINE_MANAGER" || currentRole === "HR_MANAGER";
  const isEmployee = currentRole === "EMPLOYEE";
  const isSuperAdmin = currentRole === "SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isLoading,
        login,
        logout,
        switchRole,
        switchUser,
        isHrAdmin,
        isManager,
        isEmployee,
        isSuperAdmin,
        availableUsers: INITIAL_EMPLOYEES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
