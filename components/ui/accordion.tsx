import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  value,
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("border-b border-white/10 py-3", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg
          className={cn("h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 text-xs text-slate-400 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

export function Accordion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("w-full divide-y divide-white/10", className)}>{children}</div>;
}
