import * as React from "react";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs text-slate-400 font-medium", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">{children}</ol>
    </nav>
  );
}

export function BreadcrumbItem({
  className,
  children,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("inline-flex items-center gap-1.5", className)} {...props}>
      {children}
    </li>
  );
}

export function BreadcrumbLink({
  className,
  children,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn("transition hover:text-white hover:underline", className)}
      {...props}
    >
      {children}
    </a>
  );
}

export function BreadcrumbSeparator({
  className,
  children = "/",
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("text-slate-600 select-none", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function BreadcrumbPage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-current="page"
      className={cn("font-bold text-[#5ee6d8]", className)}
      {...props}
    >
      {children}
    </span>
  );
}
