"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { fitnessProfile, type LiftId } from "@/lib/portfolio/fitness-profile";
import "./big-three-record.css";

type Lift = (typeof fitnessProfile.lifts)[number];

function TrainingVideo({ lift }: { lift: Lift }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const src = fitnessProfile.videos[lift.id];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Restore the source if a development StrictMode cleanup unloaded it.
    video.setAttribute("src", src);
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return <>
    <video ref={videoRef} className="big-three-video" controls preload="none" muted playsInline
      poster={`/gym/videos/${lift.id}-poster.jpg`} src={src}
      aria-label={`${lift.label} training video`} onError={() => setFailed(true)}>
      Your browser does not support video playback. <a href={src}>Open the video</a>
    </video>
    {failed && <p className="big-three-error" role="status">This video could not be played. <a href={src} target="_blank" rel="noreferrer">Open the video</a></p>}
  </>;
}

export default function BigThreeRecord() {
  const id = useId();
  const [selected, setSelected] = useState<LiftId>("squat");
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = fitnessProfile.lifts.length - 1;
    const next = event.key === "ArrowRight" ? (index + 1) % (last + 1)
      : event.key === "ArrowLeft" ? (index + last) % (last + 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(fitnessProfile.lifts[next].id);
    tabsRef.current[next]?.focus({ preventScroll: true });
  }

  return <article className="big-three-record" aria-label="Big Three Record">
    <header className="big-three-header">
      <h2>Big Three Record<span aria-hidden="true">.</span></h2>
      <div className="big-three-total" role="group" aria-label="Combined lifts"><strong>{fitnessProfile.totalKg}<small> kg</small></strong></div>
    </header>

    <div className="big-three-tabs" role="tablist" aria-label="Training videos">
      {fitnessProfile.lifts.map((lift, index) => <button key={lift.id} type="button" role="tab"
        ref={element => { tabsRef.current[index] = element; }} id={`${id}-${lift.id}-tab`}
        aria-controls={`${id}-${lift.id}-panel`} aria-selected={selected === lift.id}
        tabIndex={selected === lift.id ? 0 : -1} onClick={() => setSelected(lift.id)}
        onKeyDown={event => moveTab(event, index)}>
        <span>{lift.label}</span><strong>{lift.weightKg}<small> kg</small></strong>
      </button>)}
    </div>

    {fitnessProfile.lifts.map(lift => <div key={lift.id} className="big-three-panel" role="tabpanel"
      id={`${id}-${lift.id}-panel`} aria-labelledby={`${id}-${lift.id}-tab`} hidden={selected !== lift.id} tabIndex={0}>
      {selected === lift.id && <TrainingVideo key={lift.id} lift={lift} />}
    </div>)}
  </article>;
}
