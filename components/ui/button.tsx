import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-primary text-primary-foreground hover:opacity-90": variant === "default" || variant === "accent",
            "bg-secondary text-secondary-foreground hover:bg-slate-700": variant === "secondary",
            "border border-border bg-transparent text-slate-300 hover:bg-white/5 hover:text-white": variant === "outline",
            "hover:bg-white/10 text-slate-300 hover:text-white": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-9 px-4 py-2": size === "default",
            "h-7 rounded-lg px-2.5 text-[11px]": size === "sm",
            "h-11 rounded-xl px-6 text-sm": size === "lg",
            "h-9 w-9 rounded-xl": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
