import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Collapsible({
  open: customOpen,
  onOpenChange,
  defaultOpen = false,
  children,
  className,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = customOpen !== undefined ? customOpen : internalOpen;

  const toggle = React.useCallback(() => {
    const next = !isOpen;
    if (customOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }, [isOpen, customOpen, onOpenChange]);

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        if ((child.type as any).displayName === "CollapsibleTrigger") {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: toggle,
            "aria-expanded": isOpen,
          });
        }
        if ((child.type as any).displayName === "CollapsibleContent") {
          if (!isOpen) return null;
          return child;
        }
        return child;
      })}
    </div>
  );
}

export function CollapsibleTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn("flex items-center justify-between text-left", className)}
      {...props}
    >
      {children}
    </button>
  );
}
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export function CollapsibleContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-in fade-in-0 duration-150", className)}
      {...props}
    >
      {children}
    </div>
  );
}
CollapsibleContent.displayName = "CollapsibleContent";
