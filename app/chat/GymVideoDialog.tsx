"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LiftId } from "@/lib/portfolio/fitness-profile";
import "./gym-video.css";

type VideoLift = { id: LiftId; label: string; weightKg: number };

export default function GymVideoDialog({ lift, onClose }: { lift: VideoLift; onClose: () => void }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const video = videoRef.current;
    dialog?.showModal();
    return () => {
      video?.pause();
      dialog?.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  function close() {
    videoRef.current?.pause();
    onClose();
  }

  return <dialog className="gym-video-dialog" ref={dialogRef} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); event.stopPropagation(); close(); }}>
    <div className="gym-video-panel">
      <header className="gym-video-heading">
        <div><span>BIG THREE RECORD</span><h3 id={titleId}>{lift.label}<small>Personal record · {lift.weightKg} kg</small></h3></div>
        <button type="button" className="gym-video-close" aria-label="Close training video" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </header>
      <video ref={videoRef} className="gym-video-player" controls preload="none" muted playsInline
        poster={`/gym/videos/${lift.id}-poster.jpg`} src={`/gym/videos/${lift.id}.mp4`}
        aria-label={`${lift.label} training video`} onError={() => setFailed(true)}>
        Your browser does not support video playback.
      </video>
      {failed && <p className="gym-video-error" role="status">This video could not be played. <a href={`/gym/videos/${lift.id}.mp4`}>Open the video</a></p>}
    </div>
  </dialog>;
}
