import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {children}
    </div>
  );
}

export function DropdownMenuContent({
  open,
  className,
  align = "end",
  children,
}: {
  open: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl border border-white/10 bg-[#0c1322]/95 p-1 text-slate-100 shadow-2xl backdrop-blur animate-in fade-in-0 zoom-in-95",
        align === "end" && "right-0 origin-top-right",
        align === "start" && "left-0 origin-top-left",
        align === "center" && "left-1/2 -translate-x-1/2 origin-top",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  active,
  children,
  onClick,
}: {
  className?: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer select-none outline-none",
        active
          ? "bg-[#22b8aa]/15 text-[#5ee6d8]"
          : "text-slate-300 hover:bg-white/10 hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
}
