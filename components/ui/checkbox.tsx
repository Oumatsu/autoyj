import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={onChange}
        className={cn(
          "h-4 w-4 rounded border border-white/20 bg-[#0c1322] text-[#22b8aa] accent-[#22b8aa] focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition",
          className
        )}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
