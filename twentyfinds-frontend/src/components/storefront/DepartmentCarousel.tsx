"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStorefrontCopy } from "@/features/storefront/StorefrontCopy";
import { Icon } from "./Icon";

function moveTrack(track: HTMLUListElement, direction: number, reduceMotion: boolean) {
  const first = track.children[0];
  const second = track.children[1];
  const maximum = track.scrollWidth - track.clientWidth;
  if (!first || !second || maximum <= 2) return;

  const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  const loop = direction > 0 ? track.scrollLeft >= maximum - 2 : track.scrollLeft <= 2;
  const left = loop
    ? direction > 0 ? 0 : maximum
    : Math.max(0, Math.min(maximum, track.scrollLeft + direction * step));

  track.scrollTo({ left, behavior: reduceMotion || loop ? "instant" : "smooth" });
}

export function DepartmentCarousel({ children }: { children: ReactNode }) {
  const copy = useStorefrontCopy();
  const carousel = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const element = track.current;
    if (!element) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(media.matches);
    const syncSize = () => setOverflow(element.scrollWidth - element.clientWidth > 2);
    const observer = new ResizeObserver(syncSize);
    observer.observe(element);
    for (const item of element.children) observer.observe(item);
    media.addEventListener("change", syncMotion);
    syncMotion();
    syncSize();

    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncMotion);
    };
  }, [children]);

  useEffect(() => {
    if (paused || reduceMotion || !overflow) return;

    const timer = window.setInterval(() => {
      const element = track.current;
      if (!element || document.hidden || carousel.current?.matches(":hover, :focus-within")) return;
      moveTrack(element, 1, false);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [overflow, paused, reduceMotion]);

  function move(direction: number) {
    if (track.current) moveTrack(track.current, direction, reduceMotion);
  }

  return (
    <div className="department-carousel" ref={carousel}>
      <ul className="departments-grid" id="department-carousel-track" ref={track}>
        {children}
      </ul>
      {overflow && (
        <div className="department-controls">
          <button type="button" aria-controls="department-carousel-track" onClick={() => move(-1)}
            aria-label={copy("homepage.categories-previous", "Previous categories")}>
            <span className="department-previous"><Icon name="arrow-right" size={16} /></span>
          </button>
          {!reduceMotion && (
            <button type="button" onClick={() => setPaused((value) => !value)}>
              {paused ? copy("homepage.categories-play", "Play") : copy("homepage.categories-pause", "Pause")}
            </button>
          )}
          <button type="button" aria-controls="department-carousel-track" onClick={() => move(1)}
            aria-label={copy("homepage.categories-next", "Next categories")}>
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
