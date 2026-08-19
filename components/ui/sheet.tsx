import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  children,
}: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-10 flex flex-col border-white/10 bg-[#0c1322] p-6 text-white shadow-2xl transition-transform duration-300 ease-in-out",
          side === "right" && "ml-auto h-full w-full max-w-md border-l animate-in slide-in-from-right",
          side === "left" && "mr-auto h-full w-full max-w-md border-r animate-in slide-in-from-left",
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
  return <div className={cn("flex flex-col space-y-1.5 text-left mb-4", className)} {...props} />;
}

export function SheetTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-black text-white", className)} {...props}>
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
    <p className={cn("text-xs text-slate-400", className)} {...props}>
      {children}
    </p>
  );
}
