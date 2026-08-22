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
  registerUser: (userData: { employeeCode?: string; name: string; email: string; role: Role }) => Employee;
  logout: () => void;
  switchRole: (role: Role) => void;
  switchUser: (employeeId: string) => void;
  updateUser: (updated: Partial<Employee>) => void;
  isHrAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  isSuperAdmin: boolean;
  availableUsers: Employee[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [registeredUsers, setRegisteredUsers] = useState<Employee[]>([]);
  const [user, setUser] = useState<Employee | null>(INITIAL_EMPLOYEES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load custom registered users and active session on mount
  useEffect(() => {
    try {
      let savedRegistered: Employee[] = [];
      const rawRegistered = localStorage.getItem("dayflow_registered_users");
      if (rawRegistered) {
        savedRegistered = JSON.parse(rawRegistered);
        setRegisteredUsers(savedRegistered);
      }

      const allUsers = [...INITIAL_EMPLOYEES, ...savedRegistered];
      const savedUserId = localStorage.getItem("dayflow_active_user_id");

      if (savedUserId) {
        const savedCustom = localStorage.getItem(`dayflow_custom_${savedUserId}`);
        if (savedCustom) {
          setUser(JSON.parse(savedCustom));
          return;
        }
        const found = allUsers.find((e) => e.id === savedUserId);
        if (found) {
          setUser(found);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const registerUser = (userData: { employeeCode?: string; name: string; email: string; role: Role }) => {
    const parts = userData.name.trim().split(" ");
    const firstName = parts[0] || "User";
    const lastName = parts.slice(1).join(" ") || "Member";

    const newEmp: Employee = {
      id: `emp-custom-${Date.now()}`,
      user_id: `usr-${Date.now()}`,
      organization_id: "11111111-1111-1111-1111-111111111111",
      employee_code: userData.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      first_name: firstName,
      last_name: lastName,
      display_name: userData.name,
      work_email: userData.email,
      personal_email: userData.email,
      phone: "+91 98765 43210",
      role: userData.role,
      department_name: userData.role === "HR_ADMIN" ? "Human Resources" : userData.role === "LINE_MANAGER" ? "Engineering Management" : "Engineering Core",
      job_title: userData.role === "HR_ADMIN" ? "HR Administrator" : userData.role === "LINE_MANAGER" ? "Lead Engineering Manager" : "Software Engineer",
      location_name: "Bengaluru Hub",
      manager_name: "Alex Vance (CEO)",
      joining_date: new Date().toISOString().split("T")[0],
      employment_status: "ACTIVE",
      employment_type: "FULL_TIME",
      timezone: "Asia/Kolkata (IST)",
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
      address: "Bellandur, Bengaluru, Karnataka - 560103",
      bio: `Team member at NMIT (Nitte Meenakshi Institute of Technology) specialized in ${userData.role === "HR_ADMIN" ? "People Operations" : "Engineering & Academics"}.`,
      salary_structure: {
        basic: 85000,
        hra: 34000,
        special_allowance: 22000,
        conveyance_allowance: 5000,
        medical_allowance: 4000,
        gross_earnings: 150000,
        provident_fund: 10200,
        professional_tax: 200,
        income_tax_tds: 12600,
        total_deductions: 23000,
        net_salary: 127000,
        currency: "INR",
      },
    };

    const updated = [...registeredUsers, newEmp];
    setRegisteredUsers(updated);
    try {
      localStorage.setItem("dayflow_registered_users", JSON.stringify(updated));
    } catch {}

    setUser(newEmp);
    try {
      localStorage.setItem("dayflow_active_user_id", newEmp.id);
    } catch {}

    return newEmp;
  };

  const login = async (email: string, customRole?: Role) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const allUsers = [...registeredUsers, ...INITIAL_EMPLOYEES];

      // 1. Look for exact match by work_email or personal_email or employee_code
      let matched = allUsers.find(
        (e) =>
          e.work_email.toLowerCase() === cleanEmail ||
          e.personal_email?.toLowerCase() === cleanEmail ||
          e.employee_code.toLowerCase() === cleanEmail
      );

      // 2. If no exact match and customRole provided
      if (!matched && customRole) {
        matched = allUsers.find((e) => e.role === customRole);
      }

      // 3. If user entered a custom new email not in demo seed, automatically register them!
      if (!matched) {
        // Derive clean name from email prefix e.g. "dhruv.singh@gmail.com" -> "Dhruv Singh"
        const prefix = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
        const derivedName = prefix
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ") || "Employee User";

        matched = registerUser({
          name: derivedName,
          email: email.trim(),
          role: customRole || "EMPLOYEE",
          employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        });
      }

      // Check if custom edits exist in storage
      const savedCustom = localStorage.getItem(`dayflow_custom_${matched.id}`);
      const finalUser = savedCustom ? JSON.parse(savedCustom) : matched;

      setUser(finalUser);
      localStorage.setItem("dayflow_active_user_id", finalUser.id);
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
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  };

  const switchRole = (newRole: Role) => {
    if (!user) return;
    const updatedUser: Employee = {
      ...user,
      role: newRole,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem(`dayflow_custom_${user.id}`, JSON.stringify(updatedUser));
    } catch {}
  };

  const switchUser = (employeeId: string) => {
    const allUsers = [...registeredUsers, ...INITIAL_EMPLOYEES];
    const matched = allUsers.find((e) => e.id === employeeId);
    if (matched) {
      const savedCustom = localStorage.getItem(`dayflow_custom_${matched.id}`);
      const finalUser = savedCustom ? JSON.parse(savedCustom) : matched;
      setUser(finalUser);
      try {
        localStorage.setItem("dayflow_active_user_id", finalUser.id);
      } catch {}
    }
  };

  const updateUser = (updated: Partial<Employee>) => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    try {
      localStorage.setItem(`dayflow_custom_${merged.id}`, JSON.stringify(merged));
    } catch {}
  };

  const currentRole = user?.role || "EMPLOYEE";
  const isHrAdmin = currentRole === "HR_ADMIN" || currentRole === "SUPER_ADMIN";
  const isManager = currentRole === "LINE_MANAGER" || currentRole === "HR_MANAGER";
  const isEmployee = currentRole === "EMPLOYEE";
  const isSuperAdmin = currentRole === "SUPER_ADMIN";

  const allAvailableUsers = [...registeredUsers, ...INITIAL_EMPLOYEES];

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isLoading,
        login,
        registerUser,
        logout,
        switchRole,
        switchUser,
        updateUser,
        isHrAdmin,
        isManager,
        isEmployee,
        isSuperAdmin,
        availableUsers: allAvailableUsers,
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
