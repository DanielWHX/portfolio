"use client";

import { useEffect, useRef, useState } from "react";

const chapters = [
  { label: "A week, organized", time: 3.5, stamp: "00:04" },
  { label: "Break down a goal", time: 11.7, stamp: "00:12" },
  { label: "Resolve a conflict", time: 24.9, stamp: "00:25" },
  { label: "Focus on a subtask", time: 40.8, stamp: "00:41" },
];

export default function DemoVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const localMedia = useRef<string | null>(null);
  const pendingLoad = useRef<AbortController | null>(null);
  const [active, setActive] = useState(-1);
  const [ready, setReady] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep server-rendered chapter buttons disabled until their handlers are attached.
    setReady(true);
    return () => {
      pendingLoad.current?.abort();
      if (localMedia.current) URL.revokeObjectURL(localMedia.current);
    };
  }, []);

  async function seek(time: number, index: number) {
    const player = video.current;
    if (!player || seeking) return;
    setSeeking(true);
    setError("");
    try {
      const canSeek = Array.from({ length: player.seekable.length }, (_, i) => i)
        .some(i => player.seekable.start(i) <= time && player.seekable.end(i) >= time);
      // Some local/static hosts omit byte-range support. The small demo can
      // still support chapters by loading a seekable local media object once.
      if (!canSeek && !localMedia.current) {
        const controller = new AbortController();
        pendingLoad.current = controller;
        const response = await fetch("/projects/lyntra/demo.mp4", { signal: controller.signal });
        if (!response.ok) throw new Error("Video unavailable");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        localMedia.current = url;
        await new Promise<void>((resolve, reject) => {
          player.addEventListener("loadedmetadata", () => resolve(), { once: true, signal: controller.signal });
          player.addEventListener("error", () => reject(new Error("Video unavailable")), { once: true, signal: controller.signal });
          controller.signal.addEventListener("abort", () => reject(new Error("Aborted")), { once: true });
          player.src = url;
          player.load();
        });
      }
      player.currentTime = time;
      setActive(index);
      await player.play();
    } catch {
      if (!pendingLoad.current?.signal.aborted) setError("Use the video controls to play this chapter.");
    } finally {
      setSeeking(false);
    }
  }

  return <div className="case-demo-player">
    <video ref={video} controls playsInline preload="auto" poster="/projects/lyntra/poster.jpg" aria-label="Lyntra product demonstration" onTimeUpdate={() => {
      const time = video.current?.currentTime ?? 0;
      setActive(chapters.findLastIndex(chapter => time >= chapter.time));
    }}>
      <source src="/projects/lyntra/demo.mp4" type="video/mp4" />
      <track kind="captions" src="/projects/lyntra/captions.vtt" srcLang="en" label="English" />
      Your browser does not support embedded video. <a href="/projects/lyntra/demo.mp4">Watch the demo</a>.
    </video>
    <nav className="case-chapters" aria-label="Demo chapters" aria-busy={seeking}>{chapters.map((chapter, index) => <button key={chapter.time} type="button" disabled={!ready || seeking} onClick={() => void seek(chapter.time, index)} aria-pressed={active === index}><span>{chapter.stamp}</span>{chapter.label}<span className="chapter-arrow" aria-hidden="true">↗</span></button>)}</nav>
    {error ? <p className="case-video-error" role="status">{error}</p> : null}
  </div>;
}
