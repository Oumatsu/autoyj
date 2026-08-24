import * as React from "react";
import { cn } from "@/lib/utils";

export function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function PaginationItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

export function PaginationLink({
  className,
  isActive,
  children,
  ...props
}: React.ComponentProps<"button"> & { isActive?: boolean }) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl border border-border text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 cursor-pointer",
        isActive && "border-primary bg-primary/15 text-primary font-mono",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PaginationPrevious({
  className,
  children = "← 上一页",
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("w-auto px-3 py-1.5", className)}
      {...props}
    >
      {children}
    </PaginationLink>
  );
}

export function PaginationNext({
  className,
  children = "下一页 →",
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("w-auto px-3 py-1.5", className)}
      {...props}
    >
      {children}
    </PaginationLink>
  );
}
