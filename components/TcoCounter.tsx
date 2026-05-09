"use client";

import { useEffect, useRef, useState } from "react";

export function TcoCounter() {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const el = document.getElementById("tco-num");
    if (!el) return;

    const handleScroll = () => {
      if (doneRef.current) return;
      const rect = el!.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        doneRef.current = true;
        let n = 0;
        const tick = setInterval(() => {
          n = Math.min(n + 7, 300);
          setCount(n);
          if (n >= 300) clearInterval(tick);
        }, 18);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <span id="tco-num">{count}</span>;
}
