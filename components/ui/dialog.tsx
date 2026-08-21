import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  if (!open) return null;
  const isManagementDialog = className?.includes("max-w-4xl") ?? false;
  const contentClassName = isManagementDialog ? className?.replace("max-w-4xl", "") : className;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-border bg-background p-6 text-foreground shadow-2xl animate-in zoom-in-95 duration-200",
          isManagementDialog && "flex h-[min(92vh,1100px)] max-w-[min(96vw,1600px)] flex-col overflow-hidden [&>div.grid]:!max-h-none [&>div.grid]:min-h-0 [&>div.grid]:flex-1 [&>div.grid]:md:grid-cols-2 [&>div.grid]:xl:grid-cols-3 [&>div.grid>section]:grid [&>div.grid>section]:grid-cols-1 [&>div.grid>section]:gap-3 [&>div.grid>section]:md:grid-cols-2",
          contentClassName,
        )}
      >
        {children}
        {isManagementDialog && <button type="button" onClick={() => onOpenChange(false)} className="absolute right-4 top-4 grid size-9 place-items-center rounded border border-border text-lg font-black text-foreground hover:bg-white/10 cursor-pointer" aria-label="Close dialog">×</button>}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 text-left mb-4", className)} {...props} />;
}

export function DialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-black text-foreground", className)} {...props}>
      {children}
    </h3>
  );
}

export function DialogDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 mt-6", className)} {...props} />;
}
