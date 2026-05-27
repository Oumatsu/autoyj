"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollColorCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [colored, setColored] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setColored(entry.isIntersecting);
      },
      {
        rootMargin: "-47.5% 0px -47.5% 0px",
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className ?? ""} ${colored ? "colored" : ""}`} style={style}>
      {children}
    </div>
  );
}
