import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open, onOpenChange, children }: PopoverProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: PointerEvent | MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    if (open) {
      document.addEventListener("pointerdown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      {children}
    </div>
  );
}

export function PopoverContent({
  open,
  className,
  children,
  align = "center",
}: {
  open: boolean;
  className?: string;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-72 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "start" && "left-0",
        align === "end" && "right-0",
        className
      )}
    >
      {children}
    </div>
  );
}
