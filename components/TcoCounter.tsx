"use client";

import { useEffect, useRef, useState } from "react";

export function TcoCounter() {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !doneRef.current) {
          doneRef.current = true;
          let n = 0;
          const tick = setInterval(() => {
            n = Math.min(n + 7, 300);
            setCount(n);
            if (n >= 300) clearInterval(tick);
          }, 18);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <span id="tco-num" ref={elRef}>{count}</span>;
}
