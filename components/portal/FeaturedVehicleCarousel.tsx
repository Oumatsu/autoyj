"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type FeaturedVehicleCarouselResource = {
  id: string;
  brand: string;
  model: string;
  trim?: string | null;
  imageUrl: string;
  priceLabel: string;
};

const AUTO_ADVANCE_MS = 5_000;
const CARD_GAP_PX = 16;

function resourceName(resource: FeaturedVehicleCarouselResource) {
  return [resource.brand, resource.model].filter(Boolean).join(" ");
}

export function FeaturedVehicleCarousel({
  resources,
  onSelect,
  title = "Top featured vehicle resources",
}: {
  resources: FeaturedVehicleCarouselResource[];
  onSelect: (vehicleId: string) => void;
  title?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [trackIndex, setTrackIndex] = useState(() => resources.length > 1 ? 1 : 0);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const resourceCount = resources.length;
  const isLooping = resourceCount > 1;
  const trackResources = useMemo(
    () => isLooping ? [resources[resourceCount - 1], ...resources, resources[0]] : resources,
    [isLooping, resourceCount, resources],
  );
  const activeResourceIndex = isLooping ? trackIndex - 1 : 0;

  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    const measure = () => setStageWidth(stage.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setShouldAnimate(false);
    setTrackIndex(resourceCount > 1 ? 1 : 0);
    const frame = window.requestAnimationFrame(() => setShouldAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [resourceCount]);

  useEffect(() => {
    if (!isLooping) return;
    const timer = window.setInterval(() => setTrackIndex((current) => current + 1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [isLooping, trackIndex]);

  if (resourceCount === 0) return null;

  const move = (direction: -1 | 1) => {
    if (isLooping) setTrackIndex((current) => current + direction);
  };

  const resetAtLoopBoundary = () => {
    const boundaryIndex = trackIndex === 0 ? resourceCount : trackIndex === resourceCount + 1 ? 1 : null;
    if (boundaryIndex === null) return;
    setShouldAnimate(false);
    setTrackIndex(boundaryIndex);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setShouldAnimate(true)));
  };

  const cardWidth = Math.min(stageWidth * 0.78, 620);
  const trackOffset = stageWidth > 0 ? stageWidth / 2 - cardWidth / 2 - trackIndex * (cardWidth + CARD_GAP_PX) : 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerStartX.current === null || pointerStartY.current === null) return;
    const deltaX = e.clientX - pointerStartX.current;
    const deltaY = e.clientY - pointerStartY.current;
    pointerStartX.current = null;
    pointerStartY.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        move(1);
      } else {
        move(-1);
      }
    }
  };

  const handlePointerCancel = () => {
    pointerStartX.current = null;
    pointerStartY.current = null;
  };

  return (
    <section aria-label="Featured vehicle resources" aria-roledescription="carousel" className="overflow-hidden rounded-2xl border border-[#d5ad49]/35 bg-[#070e1b] p-4 shadow-xl shadow-black/20 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d5ad49]">Featured stock</p>
          <h2 className="mt-1 text-lg font-black text-white sm:text-xl">{title}</h2>
        </div>
        <div className="flex shrink-0 gap-2" aria-label="Featured vehicle carousel controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous featured vehicle" className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-lg text-slate-200 transition hover:border-[#d5ad49] hover:text-[#d5ad49]" disabled={!isLooping}>←</button>
          <button type="button" onClick={() => move(1)} aria-label="Next featured vehicle" className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-lg text-slate-200 transition hover:border-[#d5ad49] hover:text-[#d5ad49]" disabled={!isLooping}>→</button>
        </div>
      </div>

      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="relative h-[340px] overflow-hidden touch-pan-y sm:h-[410px] lg:h-[460px]"
        aria-live="polite"
      >
        <div
          data-featured-carousel-track="true"
          onTransitionEnd={resetAtLoopBoundary}
          className={`flex h-full gap-4 will-change-transform ${shouldAnimate ? "transition-transform duration-700 ease-out motion-reduce:transition-none" : ""}`}
          style={{ transform: `translate3d(${trackOffset}px, 0, 0)` }}
        >
          {trackResources.map((resource, index) => {
            const isActive = index === trackIndex;
            const name = resourceName(resource);
            return (
              <article key={`${resource.id}-${index}`} data-featured-card-position={isActive ? "active" : "adjacent"} aria-label={`${isActive ? "Current" : "Featured"} vehicle: ${name}`} className={`relative h-full w-[78vw] max-w-[620px] shrink-0 overflow-hidden rounded-2xl border bg-[#0c1424] shadow-2xl shadow-black/40 transition-[transform,opacity] duration-700 ${isActive ? "scale-100 border-white/20 opacity-100" : "scale-90 border-white/10 opacity-55"}`}>
                {resource.imageUrl ? (
                  <img src={resource.imageUrl} alt={name} className="h-full w-full object-cover" loading={isActive ? "eager" : "lazy"} decoding="async" />
                ) : (
                  <div aria-label={`${name} image unavailable`} className="grid h-full place-items-center bg-[#0c1424] text-xs font-bold text-slate-500">Image unavailable</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a13] via-[#050a13]/35 to-transparent" />
                {isActive ? (
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f3cf6a]">Featured resource</p>
                    <h3 className="mt-2 text-xl font-black text-white sm:text-3xl">{name}</h3>
                    {resource.trim ? <p className="mt-2 text-sm text-slate-200 sm:text-base">{resource.trim}</p> : null}
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <strong className="font-mono text-lg text-[#f3cf6a] sm:text-xl">{resource.priceLabel}</strong>
                      <button type="button" onClick={() => onSelect(resource.id)} aria-label={`View featured vehicle ${name}`} className="rounded-lg bg-[#d5ad49] px-4 py-2.5 text-sm font-black text-[#07111f] transition hover:bg-[#f3cf6a]">View stock</button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
      <p className="sr-only">Showing featured vehicle {activeResourceIndex + 1} of {resourceCount}</p>
    </section>
  );
}
