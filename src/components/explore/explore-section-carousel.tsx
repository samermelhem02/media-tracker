"use client";

import { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";

const CAROUSEL_GAP_PX = 16;
const DESKTOP_BREAKPOINT_PX = 1024;

export function ExploreSectionCarousel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const childArray = Array.isArray(children) ? children : [children];
  const count = childArray.filter(Boolean).length;

  const updateCardWidth = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const cardsPerRow = w >= DESKTOP_BREAKPOINT_PX ? 4 : 2;
    const gapTotal = (cardsPerRow - 1) * CAROUSEL_GAP_PX;
    const width = Math.floor((w - gapTotal) / cardsPerRow);
    setCardWidth(width > 0 ? width : 200);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useLayoutEffect(() => {
    updateCardWidth();
    const ro = new ResizeObserver(updateCardWidth);
    const el = viewportRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [updateCardWidth]);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    if (!cardWidth) return;
    const id = requestAnimationFrame(() => updateScrollState());
    return () => cancelAnimationFrame(id);
  }, [cardWidth, count, updateScrollState]);

  const scrollByTwo = (direction: "left" | "right") => {
    const el = viewportRef.current;
    if (!el || !cardWidth) return;
    const step = 2 * cardWidth + CAROUSEL_GAP_PX;
    el.scrollBy({ left: direction === "right" ? step : -step, behavior: "smooth" });
  };

  if (count === 0) return null;

  return (
    <div className="min-w-0">
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      ) : null}
      <div className="relative min-w-0">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByTwo("left")}
            className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black/90"
            aria-label="Previous"
          >
            <span className="text-xl leading-none">‹</span>
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByTwo("right")}
            className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black/90"
            aria-label="Next"
          >
            <span className="text-xl leading-none">›</span>
          </button>
        )}
        <div
          ref={viewportRef}
          className="min-w-0 overflow-x-auto overflow-y-hidden scroll-smooth touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex flex-nowrap gap-4 py-1" style={{ width: "max-content" }}>
            {childArray.map((child, i) => (
              <div
                key={i}
                className="flex-shrink-0"
                style={{ width: cardWidth || 200 }}
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
