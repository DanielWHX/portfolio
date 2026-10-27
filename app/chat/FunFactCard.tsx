"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";
import { funFactLinks, funFactPhoto } from "@/lib/portfolio/fun-facts";
import BigThreeDialog from "./BigThreeDialog";
import FunFactPhotoDialog from "./FunFactPhotoDialog";
import "./fun-facts.css";

function InterestIcon({ kind }: { kind: "gym" | "code" | "whatnot" | "travel" }) {
  if (kind === "whatnot") return <svg viewBox="0 0 26 22" aria-hidden="true"><path fill="#f8ed50" stroke="#d6c83b" strokeWidth=".65" strokeLinejoin="round" d="M5.1 3.5C1.2 3.5-.2 8.2 2.4 11l5.3 5.5c1.2 1.3 2.6 1.3 3.9 0l1-1-1.9-3.7 4 3.9c1.2 1.2 2.6 1.2 3.8 0l5-5.3c2.6-2.8 1.1-7-2.7-7-1.5 0-2.3.7-3.2 1.6l-1.6 1.6-2-2c-1.1-1.1-2.7-1.1-3.8 0L8.6 6.2 7.3 4.9C6.7 4.2 6 3.5 5.1 3.5Z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "gym" ? <path d="m6 6 12 12M3 8l5-5M16 21l5-5M2 6l4-4M18 22l4-4M5 10l5-5M14 19l5-5" />
      : kind === "code" ? <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16" />
      : <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" />}
  </svg>;
}

export default function FunFactCard({ summary, onOverlayOpenChange }: { summary: string; onOverlayOpenChange?: (open: boolean) => void }) {
  const [overlay, setOverlay] = useState<"photo" | "gym" | null>(null);
  const photoButtonRef = useRef<HTMLButtonElement>(null);
  const photoId = useId();
  const gymId = useId();
  const gymOpen = overlay === "gym";

  const setOpen = useCallback((next: "photo" | "gym" | null) => {
    setOverlay(next);
    onOverlayOpenChange?.(next !== null);
  }, [onOverlayOpenChange]);
  const closeOverlay = useCallback(() => setOpen(null), [setOpen]);

  return <article className="fun-facts-card" aria-label="Fun Facts">
    <figure className="fun-facts-figure">
      <button ref={photoButtonRef} type="button" className="fun-facts-photo" aria-label="View skydiving photo" aria-haspopup="dialog"
        aria-expanded={overlay === "photo"} aria-controls={overlay === "photo" ? photoId : undefined} onClick={() => setOpen("photo")}>
        <Image {...funFactPhoto} className="fun-facts-photo-image" unoptimized />
        <span className="fun-facts-photo-expand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" /></svg></span>
      </button>
      <figcaption><span>Skydiving</span><span>Beyond the everyday.</span></figcaption>
    </figure>
    <p className="fun-facts-summary">{summary}</p>
    <div className="fun-facts-links" role="group" aria-label="Explore my interests">
      <button type="button" className="fun-facts-link fun-facts-link-gym" aria-expanded={gymOpen} aria-haspopup="dialog" aria-controls={gymOpen ? gymId : undefined} onClick={() => setOpen("gym")}>
        <InterestIcon kind="gym" /><span>Big Three Record</span><span className="fun-facts-chevron" aria-hidden="true">↗</span>
      </button>
      <a className="fun-facts-link fun-facts-link-code" href={funFactLinks.leetcode} target="_blank" rel="noreferrer"><InterestIcon kind="code" /><span>LeetCode notes</span><span className="fun-facts-external" aria-hidden="true">↗</span></a>
      <a className="fun-facts-link" href={funFactLinks.whatnot} target="_blank" rel="noreferrer"><InterestIcon kind="whatnot" /><span>Whatnot</span><span className="fun-facts-external" aria-hidden="true">↗</span></a>
      <button type="button" className="fun-facts-link" disabled><InterestIcon kind="travel" /><span>Footprints</span><small>Coming soon</small></button>
    </div>
    {overlay === "photo" ? <FunFactPhotoDialog id={photoId} openerRef={photoButtonRef} onClose={closeOverlay} /> : null}
    {gymOpen ? <BigThreeDialog id={gymId} onClose={closeOverlay} /> : null}
  </article>;
}
