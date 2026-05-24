"use client";

import { useEffect } from "react";

export function ScrollSnapEnabler() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("scroll-snap");

    return () => {
      html.classList.remove("scroll-snap");
    };
  }, []);

  return null;
}
