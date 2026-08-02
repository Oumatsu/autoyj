import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

export function RadioGroup({
  value,
  onValueChange,
  name,
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div className={cn("grid gap-2", className)} role="radiogroup" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value: string;
}

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(({ className, value, children, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const checked = context.value === value;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-300 transition hover:border-[#22b8aa]/40 hover:bg-white/[0.07]",
        checked && "border-[#22b8aa] bg-[#22b8aa]/10 text-white",
        className
      )}
    >
      <input
        ref={ref}
        type="radio"
        id={id}
        name={context.name}
        value={value}
        checked={checked}
        onChange={() => context.onValueChange?.(value)}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/30 transition-colors",
          checked && "border-[#22b8aa] bg-[#22b8aa]"
        )}
      >
        {checked && <div className="h-1.5 w-1.5 rounded-full bg-[#0c1322]" />}
      </div>
      {children}
    </label>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";
