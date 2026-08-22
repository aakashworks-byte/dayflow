"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  BadgePercent,
  Building,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function SignupPage() {
  const router = useRouter();
  const { registerUser } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    employeeCode: "EMP-008",
    name: "Rohan Verma",
    email: "rohan.verma@dayflow.io",
    role: "EMPLOYEE" as const,
    password: "Password123!",
    confirmPassword: "Password123!",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      registerUser({
        name: formData.name,
        email: formData.email,
        role: formData.role as any,
        employeeCode: formData.employeeCode,
      });

      setIsLoading(false);
      toast({
        title: "Employee Account Created! 🎉",
        description: `Welcome to Dayflow, ${formData.name}. Logged into your personalized dashboard.`,
        variant: "success",
      });
      router.push("/");
    } catch {
      setIsLoading(false);
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <Card className="border border-border/80 shadow-2xl backdrop-blur-xl bg-card/90 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <CardHeader className="text-center pb-4 pt-8 px-6 sm:px-8">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Join Dayflow HRMS
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
          Create an employee workspace account
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Employee ID</label>
              <Input
                placeholder="EMP-008"
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                className="h-10 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="EMPLOYEE">Employee (Standard)</option>
                <option value="HR_ADMIN">HR Administrator</option>
                <option value="LINE_MANAGER">Line Manager</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-9 h-10 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-9 h-10 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-10 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Confirm</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-10 rounded-xl"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="purple"
            className="w-full h-11 rounded-xl text-sm font-semibold gap-2 shadow-md shadow-purple-600/25 mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
