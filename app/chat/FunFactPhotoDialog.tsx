"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { funFactPhotos } from "@/lib/portfolio/photo-collection";

const count = funFactPhotos.length;
const slots = [-2, -1, 0, 1, 2];
const half = Math.floor(count / 2);
const wrap = (value: number) => (value + count) % count;

function Photo({ index, full = false }: { index: number; full?: boolean }) {
  const [failed, setFailed] = useState(false);
  const photo = funFactPhotos[index];
  return failed ? <span className="fun-photo-unavailable" role="img" aria-label={photo.alt}>Photo unavailable</span>
    : <Image src={full ? photo.src : photo.thumbnail} width={photo.width} height={photo.height} alt={photo.alt} unoptimized onError={() => setFailed(true)} />;
}

export default function FunFactPhotoDialog({ id, openerRef, onClose }: {
  id: string;
  openerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingRef = useRef(false);
  const backRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [loaded, setLoaded] = useState(() => new Set(slots.map(wrap)));

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setFocused(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { onClose(); return; }
    dialogRef.current?.setAttribute("data-closing", "true");
    dialogRef.current?.removeAttribute("data-spread");
    closeTimer.current = setTimeout(onClose, 380);
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = openerRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    // Two frames let the browser paint the compact deck before spreading it.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (!closingRef.current) dialog.setAttribute("data-spread", "true");
      });
    });
    const closeOnBackdrop = (event: MouseEvent) => { if (event.target === dialog) close(); };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finishClose = () => { if (closingRef.current) { if (closeTimer.current) clearTimeout(closeTimer.current); onClose(); } };
    dialog.addEventListener("click", closeOnBackdrop);
    motion.addEventListener("change", finishClose);
    return () => {
      cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      dialog.removeEventListener("click", closeOnBackdrop);
      motion.removeEventListener("change", finishClose);
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [openerRef, onClose, close]);

  function select(index: number) {
    const next = wrap(index);
    setActive(next);
    setLoaded(previous => new Set([...previous, ...slots.map(offset => wrap(next + offset))]));
  }
  function backToFan() {
    setFocused(false);
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLButtonElement>(`[aria-label="Enlarge photo ${active + 1}"]`)?.focus());
  }

  return createPortal(<dialog id={id} ref={dialogRef} className="fun-photo-dialog" aria-label="Photo collection"
    onCancel={event => { event.preventDefault(); if (focused) backToFan(); else close(); }}
    onKeyDown={event => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const next = wrap(active + (event.key === "ArrowRight" ? 1 : -1));
        const moveCardFocus = event.target instanceof Element && event.target.closest(".fun-photo-card");
        select(next);
        if (moveCardFocus) requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLButtonElement>(`[aria-label="Enlarge photo ${next + 1}"]`)?.focus());
      }
    }}>
    <div className="fun-photo-viewer">
      <header className="fun-photo-heading"><div><p>BEYOND THE EVERYDAY</p><h2>A few moments from my life.</h2></div>
        <button type="button" className="fun-photo-close" aria-label="Close photo collection" onClick={close}><span aria-hidden="true">×</span></button>
      </header>
      <div className="fun-photo-stage" data-focused={focused || undefined}>
        <div className="fun-photo-fan" aria-hidden={focused} inert={focused}>
          {funFactPhotos.map((photo, index) => {
            // Keep neighbours in reading order. Hidden cards sit beyond the
            // edges so entering/leaving cards slide through, never cross the centre.
            const offset = wrap(index - active + half) - half;
            const visible = Math.abs(offset) <= 2;
            const slot = Math.max(-3, Math.min(3, offset));
            return <button key={photo.src} type="button" className="fun-photo-card"
              aria-label={`Enlarge photo ${index + 1}`} aria-hidden={!visible} tabIndex={visible && !focused ? 0 : -1}
              data-visible={visible} data-active={offset === 0 || undefined}
              style={{ "--slot": slot, "--angle": `${slot * 11}deg`, "--lift": `${Math.abs(slot) * 14}px`, "--stack": `${offset * 1.5}deg`, zIndex: visible ? 10 - Math.abs(offset) : 0 } as CSSProperties}
              onClick={() => { select(index); setFocused(true); requestAnimationFrame(() => backRef.current?.focus()); }}>
              {loaded.has(index) ? <Photo index={index} /> : null}
            </button>;
          })}
        </div>
        {focused ? <div className="fun-photo-focus">
          <Photo key={active} index={active} full />
          <button ref={backRef} type="button" className="fun-photo-back" onClick={backToFan}>← <span>Back to photo fan</span></button>
        </div> : null}
      </div>
      <footer className="fun-photo-footer">
        <p>{focused ? funFactPhotos[active].alt : "Little adventures. Good company. Life in between."}</p>
        <div className="fun-photo-navigation" role="group" aria-label="Browse photos">
          <button type="button" aria-label="Previous photo" onClick={() => select(active - 1)}>←</button>
          <span role="status" aria-live="polite" aria-atomic="true">{active + 1} / {count}</span>
          <button type="button" aria-label="Next photo" onClick={() => select(active + 1)}>→</button>
        </div>
        <small>{focused ? "Use the arrows to keep exploring" : "Tap a photo for a closer look"}</small>
      </footer>
    </div>
  </dialog>, document.body);
}
