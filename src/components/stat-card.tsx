import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "purple" | "orange" | "green" | "blue" | "default";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "purple",
  className,
}: StatCardProps) {
  const getGradient = () => {
    switch (variant) {
      case "purple":
        return "from-purple-600/10 via-purple-600/5 to-transparent text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30";
      case "orange":
        return "from-orange-500/10 via-orange-500/5 to-transparent text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30";
      case "green":
        return "from-emerald-500/10 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
      case "blue":
        return "from-sky-500/10 via-sky-500/5 to-transparent text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30";
      default:
        return "from-zinc-500/10 via-zinc-500/5 to-transparent text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900";
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/70 hover:shadow-lg transition-all duration-300 group",
        className
      )}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-50`} />
      <CardContent className="relative p-5 sm:p-6 flex flex-col justify-between h-full z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 shadow-sm border border-border/40 backdrop-blur-sm transition-transform group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {value}
          </div>
          {(subtitle || trend) && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              {trend && (
                <span
                  className={`font-semibold ${
                    trend.isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}
                </span>
              )}
              {subtitle && (
                <span className="text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
