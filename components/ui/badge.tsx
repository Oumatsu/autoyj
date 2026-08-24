import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "accent" | "destructive" | "amber" | "indigo" | "emerald";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors uppercase tracking-wider",
        {
          "bg-primary/20 text-primary border border-primary/30": variant === "accent" || variant === "default",
          "bg-secondary text-secondary-foreground border border-border": variant === "secondary",
          "border border-border text-foreground": variant === "outline",
          "bg-destructive/20 text-destructive border border-destructive/30": variant === "destructive",
          "bg-amber-500/20 text-amber-300 border border-amber-500/30": variant === "amber",
          "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30": variant === "indigo",
          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30": variant === "emerald",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
