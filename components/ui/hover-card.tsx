import * as React from "react";
import { cn } from "@/lib/utils";

interface HoverCardContextType {
  open: boolean;
}

const HoverCardContext = React.createContext<HoverCardContextType>({
  open: false,
});

interface HoverCardProps {
  children: React.ReactNode;
}

export function HoverCard({ children }: HoverCardProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <HoverCardContext.Provider value={{ open }}>
      <div
        className="relative inline-block"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

export function HoverCardTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
}
HoverCardTrigger.displayName = "HoverCardTrigger";

export function HoverCardContent({
  className,
  children,
  align = "center",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) {
  const { open } = React.useContext(HoverCardContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 bottom-full mb-2 w-64 rounded-2xl border border-white/15 bg-[#0c1322]/95 p-4 text-xs text-white shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "start" && "left-0",
        align === "end" && "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
HoverCardContent.displayName = "HoverCardContent";
