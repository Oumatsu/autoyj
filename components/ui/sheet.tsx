import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  contentId?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  contentId,
  ariaLabel,
  children,
}: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200 overscroll-none touch-none">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        id={contentId}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "relative z-10 flex flex-col border-border bg-background p-6 text-foreground shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto overscroll-contain touch-pan-y max-h-[100dvh] h-[100dvh] [-webkit-overflow-scrolling:touch]",
          side === "right" && "ml-auto w-full max-w-md border-l animate-in slide-in-from-right",
          side === "left" && "mr-auto w-full max-w-md border-r animate-in slide-in-from-left",
          side === "top" && "mb-auto w-full border-b animate-in slide-in-from-top",
          side === "bottom" && "mt-auto w-full border-t animate-in slide-in-from-bottom"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 text-left mb-4", className)} {...props} />;
}

export function SheetTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-black text-foreground", className)} {...props}>
      {children}
    </h3>
  );
}

export function SheetDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}
