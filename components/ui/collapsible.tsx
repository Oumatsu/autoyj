import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleContextType {
  isOpen: boolean;
  toggle: () => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextType>({
  isOpen: false,
  toggle: () => {},
});

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
    <CollapsibleContext.Provider value={{ isOpen, toggle }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({
  className,
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isOpen, toggle } = React.useContext(CollapsibleContext);

  return (
    <button
      type="button"
      className={cn("flex items-center justify-between text-left", className)}
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
      aria-expanded={isOpen}
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
  const { isOpen } = React.useContext(CollapsibleContext);

  if (!isOpen) return null;

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
