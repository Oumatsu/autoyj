"use client";

/**
 * SectionGradientBridge — 自适应背景渐变过渡系统
 *
 * 设计原理：
 *   页面中 Section 之间的视觉过渡不应依赖人肉微调。
 *   本组件基于颜色分析 + 预设规则，自动生成最佳渐变桥梁。
 *
 * 视觉判断逻辑：
 *   1. 如果上下 Section 底色相同 → 不需要桥梁
 *   2. 如果底色属于同一色系且亮度差 < 15% → 短桥梁 (40-60px)
 *   3. 如果底色反差大（如 #000 → #1c1c1c）→ 中桥梁 (60-80px)
 *   4. 如果涉及图片背景 → 利用其自带 overlay 过渡，不额外加桥
 *
 * 渐变策略矩阵：
 *   ┌──────────────┬──────────────┬──────────┬──────────┐
 *   │ from → to    │ 亮度差       │ 策略      │ 高度     │
 *   ├──────────────┼──────────────┼──────────┼──────────┤
 *   │ black → mid  │ ~11%         │ linear   │ 80px     │
 *   │ mid → bg     │ ~2%          │ none     │ 0        │
 *   │ mid → bg2    │ ~3%          │ none     │ 0        │
 *   │ bg → mid     │ ~2%          │ none     │ 0        │
 *   │ bg2 → mid    │ ~3%          │ none     │ 0        │
 *   └──────────────┴──────────────┴──────────┴──────────┘
 *
 * 颜色映射表：
 *   #000000 (black)     — Hero / Gallery 背景
 *   #1c1c1c (mid)       — bg-a / bg-b 的边缘色，图片 Section 的 overlay
 *   #161616 (bg)        — bg-a 主色
 *   #232323 (bg2)       — bg-b 主色
 *
 * 注意：bg-a 和 bg-b 的 CSS 定义本身已包含上下边缘过渡到 mid，
 *       图片 Section 的 overlay 也以 mid 为边缘。
 *       因此唯一需要桥梁的场景是从 black (Hero/Gallery) 过渡到其他 Section。
 */

import { useMemo } from "react";

/** 主题色板 — 与 tailwind.config / globals.css 同步 */
export const COLORS = {
  black: "#000000",
  mid: "var(--color-mid)",
  bg: "var(--color-bg)",
  bg2: "var(--color-bg2)",
  bg3: "var(--color-bg3)",
  gold: "var(--color-gold)",
  green: "var(--color-green)",
} as const;

export type ThemeColor = keyof typeof COLORS | (string & {});

/** 亮度近似值（0-255，越大越亮），用于自动判断对比度 */
const LUMINANCE: Record<string, number> = {
  "#000000": 0,
  "#161616": 22,
  "#1c1c1c": 28,
  "#232323": 35,
  "#2a2a2a": 42,
};

function resolveColor(val: ThemeColor): string {
  if (val in COLORS) return COLORS[val as keyof typeof COLORS];
  return val;
}

function luminanceOf(cssColor: string): number {
  for (const [hex, lum] of Object.entries(LUMINANCE)) {
    if (cssColor.includes(hex)) return lum;
  }
  return 50;
}

export interface GradientBridgeProps {
  /** 上一个 Section 的底部颜色 */
  from: ThemeColor;
  /** 下一个 Section 的顶部颜色 */
  to: ThemeColor;
  /** 强制覆盖自动高度 (px) */
  height?: number;
  /** 强制覆盖渐变类型 */
  type?: "linear" | "radial" | "blur" | "none";
  /** 额外 className */
  className?: string;
}

/**
 * 自动判断两个颜色之间是否需要渐变桥梁，
 * 并生成最优的过渡方案。
 *
 * 渐变高度与亮度差的关系：
 *   亮度差 < 5  → 不生成桥梁（颜色肉眼不可区分）
 *   亮度差 < 15 → 短桥梁 50px，标准 linear
 *   亮度差 < 30 → 中桥梁 65px，带中间色阶
 *   亮度差 ≥ 30 → 长桥梁 80px，多层色阶过渡
 *
 * 由于本项目主题色均为深色系（亮度 0-42），
 * 实际只会触发前三级策略。从 #000 到 #1c1c1c 为例：
 *   亮度差 28 → 中桥梁 65px
 *   #000 → 25% #000 → 50% #1c1c1c → 75% #1c1c1c → 100% #1c1c1c
 */
function analyzeTransition(from: string, to: string) {
  const fromLum = luminanceOf(from);
  const toLum = luminanceOf(to);
  const diff = Math.abs(fromLum - toLum);

  /** 相同或视觉不可区分 → 无需过渡 */
  if (diff < 5) return { needed: false, height: 0, gradient: "" };

  /** 小差异 → 短渐变 */
  if (diff < 15) {
    return {
      needed: true,
      height: 50,
      gradient: `linear-gradient(to bottom, ${from} 0%, ${to} 100%)`,
    };
  }

  /** 中差异 → 标准渐变带中间色阶 */
  if (diff < 30) {
    return {
      needed: true,
      height: 65,
      gradient: [
        `linear-gradient(to bottom,`,
        `  ${from} 0%,`,
        `  ${from} 25%,`,
        `  ${to} 50%,`,
        `  ${to} 100%`,
        `)`,
      ].join("\n"),
    };
  }

  /** 大差异 → 长渐变多层色阶 */
  return {
    needed: true,
    height: 80,
    gradient: [
      `linear-gradient(to bottom,`,
      `  ${from} 0%,`,
      `  ${from} 15%,`,
      `  ${to} 40%,`,
      `  ${to} 100%`,
      `)`,
    ].join("\n"),
  };
}

/**
 * SectionGradientBridge
 *
 * 使用方法：
 *   <SectionGradientBridge from="black" to="mid" />
 *   <SectionGradientBridge from="mid" to="bg" />
 *   <SectionGradientBridge from="#000" to="var(--color-mid)" height={60} />
 */
export function SectionGradientBridge({
  from,
  to,
  height: forcedHeight,
  type: forcedType,
  className = "",
}: GradientBridgeProps) {
  const fromColor = resolveColor(from);
  const toColor = resolveColor(to);

  const analysis = useMemo(
    () => analyzeTransition(fromColor, toColor),
    [fromColor, toColor]
  );

  if (!analysis.needed && forcedType !== "linear") return null;
  if (forcedType === "none") return null;

  const h = forcedHeight ?? analysis.height;
  const gradient = analysis.gradient;

  return (
    <div
      className={className}
      style={{
        height: `${h}px`,
        background: gradient,
        pointerEvents: "none",
        position: "relative",
        zIndex: 2,
        width: "100%",
      }}
      aria-hidden="true"
    />
  );
}

/**
 * useSectionColor — 获取 Section 对应的边缘颜色
 * 用于在手动布局时快速获取标准颜色值
 */
export function useSectionColor(section: "hero" | "gallery" | "default"): { top: string; bottom: string } {
  switch (section) {
    case "hero":
    case "gallery":
      return { top: COLORS.black, bottom: COLORS.black };
    default:
      return { top: COLORS.mid, bottom: COLORS.mid };
  }
}

export default SectionGradientBridge;
