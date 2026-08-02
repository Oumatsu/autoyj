import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  onClose?: () => void;
}

export function Toast({
  title,
  description,
  variant = "default",
  onClose,
}: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border p-4 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200",
        variant === "default" && "border-white/15 bg-[#0c1322]/95 text-white",
        variant === "destructive" && "border-red-500/30 bg-red-950/90 text-red-200",
        variant === "success" && "border-[#22b8aa]/40 bg-[#0c1322]/95 text-[#5ee6d8]"
      )}
    >
      <div className="flex flex-col gap-1">
        {title && <div className="font-bold">{title}</div>}
        {description && <div className="text-slate-300 text-[11px]">{description}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-white transition"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {children}
    </div>
  );
}
