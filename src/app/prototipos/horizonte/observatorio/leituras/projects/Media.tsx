"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ProjectMedia } from "@/content/projects";

type Props = {
  media: ProjectMedia;
  sizes: string;
  className?: string;
  /** Card covers loop silently; gallery videos get controls instead. */
  ambient?: boolean;
  /** Gallery slides pause as soon as they stop being the current one. */
  active?: boolean;
};

/** An image or a video, filling its (positioned) parent. */
export function Media({ media, sizes, className, ambient = false, active = true }: Props) {
  if (media.type === "image") {
    return <Image src={media.src} alt={media.alt} fill sizes={sizes} className={className} />;
  }
  return <Video media={media} className={className} ambient={ambient} active={active} />;
}

function Video({
  media,
  className,
  ambient,
  active,
}: {
  media: Extract<ProjectMedia, { type: "video" }>;
  className?: string;
  ambient: boolean;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // Ambient covers play only while on screen, and never with reduced motion.
  useEffect(() => {
    const video = ref.current;
    if (!video || !ambient) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !still.matches) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [ambient]);

  useEffect(() => {
    if (!active) ref.current?.pause();
  }, [active]);

  return (
    <video
      ref={ref}
      className={className}
      src={media.src}
      poster={media.poster}
      aria-label={media.alt}
      playsInline
      preload="metadata"
      {...(ambient ? { muted: true, loop: true } : { controls: true })}
    />
  );
}
