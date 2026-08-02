import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "accent" | "amber" | "indigo" | "emerald";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors uppercase tracking-wider",
        {
          "bg-[#22b8aa]/20 text-[#5ee6d8] border border-[#22b8aa]/30": variant === "accent" || variant === "default",
          "bg-white/10 text-slate-300 border border-white/10": variant === "secondary",
          "border border-white/20 text-slate-400": variant === "outline",
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
