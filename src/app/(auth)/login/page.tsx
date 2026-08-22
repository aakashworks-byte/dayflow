"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Briefcase,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, availableUsers, switchUser } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("engineer@dayflow.io");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      setIsLoading(false);
      return;
    }

    const res = await login(email);
    setIsLoading(false);

    if (res.success) {
      toast({
        title: "Welcome back!",
        description: "Successfully signed into Dayflow HRMS.",
        variant: "success",
      });
      router.push("/");
    } else {
      setError(res.error || "Invalid credentials.");
    }
  };

  const handleQuickLogin = async (user: any) => {
    setEmail(user.work_email);
    setPassword("Password123!");
    setIsLoading(true);
    switchUser(user.id);
    toast({
      title: `Logged in as ${user.display_name}`,
      description: `Active Role: ${user.role}`,
      variant: "purple",
    });
    router.push(user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN" ? "/admin" : "/");
  };

  return (
    <Card className="border border-border/80 shadow-2xl backdrop-blur-xl bg-card/90 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <CardHeader className="text-center pb-4 pt-8 px-6 sm:px-8">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in to Dayflow
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
          "Every workday, perfectly aligned."
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 sm:px-8 space-y-5">
        {/* Quick Persona Demo Selector */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              1-Click Demo Login
            </span>
            <Badge variant="purple" className="text-[9px] px-1.5 py-0">
              Hackathon Ready
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin(availableUsers[0])}
              className="h-auto py-2 px-2.5 flex flex-col items-start text-left border-border/60 hover:border-purple-500 hover:bg-purple-500/10 rounded-xl"
            >
              <span className="text-xs font-semibold text-foreground">David Chen</span>
              <span className="text-[10px] text-muted-foreground">Employee (Engineer)</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin(availableUsers[1])}
              className="h-auto py-2 px-2.5 flex flex-col items-start text-left border-border/60 hover:border-orange-500 hover:bg-orange-500/10 rounded-xl"
            >
              <span className="text-xs font-semibold text-foreground">Elena Rostova</span>
              <span className="text-[10px] text-muted-foreground">HR Director / Admin</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin(availableUsers[2])}
              className="h-auto py-2 px-2.5 flex flex-col items-start text-left border-border/60 hover:border-purple-500 hover:bg-purple-500/10 rounded-xl"
            >
              <span className="text-xs font-semibold text-foreground">Sarah Connor</span>
              <span className="text-[10px] text-muted-foreground">VP Eng / Manager</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin(availableUsers[3])}
              className="h-auto py-2 px-2.5 flex flex-col items-start text-left border-border/60 hover:border-purple-500 hover:bg-purple-500/10 rounded-xl"
            >
              <span className="text-xs font-semibold text-foreground">Alex Vance</span>
              <span className="text-[10px] text-muted-foreground">CEO & Super Admin</span>
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center text-xs uppercase text-muted-foreground">
          <span className="h-px w-full bg-border" />
          <span className="bg-card px-3 text-[10px] tracking-wider font-semibold">
            Or Sign In With Email
          </span>
          <span className="h-px w-full bg-border" />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-10 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast({ title: "Demo Mode", description: "Default password is Password123!" });
                }}
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 h-10 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="purple"
            className="w-full h-11 rounded-xl text-sm font-semibold gap-2 shadow-md shadow-purple-600/25"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In to Workspace"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Onboard New Employee
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
