import React from "react";

export interface LoadingProps {
  text?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
  fullscreen?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Loading({
  text = "Loading...",
  subtext,
  size = "md",
  fullscreen = false,
  className = "",
  children,
}: LoadingProps) {
  const spinnerSizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-medium",
  };

  const spinnerNode = (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div
          className={`${spinnerSizeClasses[size]} rounded-full border-t-amber-500 border-r-amber-500/30 border-b-amber-500/10 border-l-amber-500/60 animate-spin`}
        />
        {/* Inner pulse core */}
        <div className="absolute w-2 h-2 bg-amber-400/80 rounded-full animate-ping" />
      </div>

      {text && (
        <p className={`${textSizeClasses[size]} text-slate-300 tracking-wide font-sans`}>
          {text}
        </p>
      )}

      {subtext && (
        <p className="text-xs text-slate-500 max-w-xs">{subtext}</p>
      )}

      {children}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        role="status"
        aria-label={text || "Loading"}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md transition-all duration-300 ${className}`}
      >
        {spinnerNode}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={text || "Loading"}
      className={`w-full py-12 flex items-center justify-center ${className}`}
    >
      {spinnerNode}
    </div>
  );
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return <Loading text={message} fullscreen />;
}

export function LoadingSkeleton({ count = 3, className = "" }: { count?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading content" className={`w-full space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full h-24 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-pulse p-4 flex flex-col justify-between"
        >
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-800/60 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
