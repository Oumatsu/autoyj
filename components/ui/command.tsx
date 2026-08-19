import * as React from "react";
import { cn } from "@/lib/utils";

export function Command({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c1322] text-white shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandInput({
  className,
  onValueChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onValueChange?: (value: string) => void;
}) {
  return (
    <div className="flex items-center border-b border-white/10 px-3">
      <svg
        className="mr-2 h-4 w-4 shrink-0 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
}

export function CommandList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden p-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandEmpty({
  children = "未搜索到匹配项",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="py-6 text-center text-xs text-slate-500 font-medium" {...props}>
      {children}
    </div>
  );
}

export function CommandItem({
  className,
  children,
  onSelect,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { onSelect?: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex w-full text-left cursor-pointer select-none items-center rounded-xl px-3 py-2 text-xs font-bold text-slate-300 outline-none hover:bg-white/5 hover:text-white transition",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
