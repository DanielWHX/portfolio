"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { funFactPhoto } from "@/lib/portfolio/fun-facts";

export default function FunFactPhotoDialog({ id, openerRef, onClose }: {
  id: string;
  openerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const closingRef = useRef(false);

  const sourceTransform = useCallback(() => {
    const source = openerRef.current?.querySelector("img")?.getBoundingClientRect();
    const destination = frameRef.current?.getBoundingClientRect();
    if (!source || !destination || !source.width || !destination.width) return null;
    return `translate(${source.left - destination.left}px, ${source.top - destination.top}px) scale(${source.width / destination.width}, ${source.height / destination.height})`;
  }, [openerRef]);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const currentTransform = frameRef.current ? getComputedStyle(frameRef.current).transform : "none";
    animationRef.current?.cancel();
    const destination = sourceTransform();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !destination || !frameRef.current) {
      onClose();
      return;
    }
    const animation = frameRef.current.animate([{ transform: currentTransform, borderRadius: "16px" }, { transform: destination, borderRadius: "14px" }],
      { duration: 300, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    animationRef.current = animation;
    dialogRef.current?.setAttribute("data-closing", "true");
    void animation.finished.then(onClose, () => { /* Unmount or reduced motion cancels the transition. */ });
  }, [onClose, sourceTransform]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const frame = frameRef.current;
    if (!dialog || !frame) return;
    const opener = openerRef.current;
    const overflow = document.body.style.overflow;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    document.body.style.overflow = "hidden";
    dialog.showModal();
    // Both images retain the same full frame, so the transition never stretches
    // or crops the photograph to fit a differently shaped viewer.
    const origin = sourceTransform();
    if (!motion.matches && origin) {
      animationRef.current = frame.animate([{ transform: origin, borderRadius: "14px" }, { transform: "none", borderRadius: "16px" }],
        { duration: 460, easing: "cubic-bezier(.22,1,.36,1)" });
    }
    const stopMotion = () => {
      animationRef.current?.cancel();
      if (closingRef.current) onClose();
    };
    const closeOnBackdrop = (event: MouseEvent) => { if (event.target === dialog) close(); };
    dialog.addEventListener("click", closeOnBackdrop);
    motion.addEventListener("change", stopMotion);
    window.addEventListener("resize", stopMotion);
    return () => {
      motion.removeEventListener("change", stopMotion);
      window.removeEventListener("resize", stopMotion);
      dialog.removeEventListener("click", closeOnBackdrop);
      animationRef.current?.cancel();
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [openerRef, onClose, sourceTransform, close]);

  return createPortal(<dialog id={id} ref={dialogRef} className="fun-photo-dialog" aria-label="Skydiving photo"
    onCancel={event => { event.preventDefault(); close(); }}>
    <div className="fun-photo-viewer">
      <div ref={frameRef} className="fun-photo-frame">
        <Image {...funFactPhoto} unoptimized />
        <button type="button" className="fun-photo-close" aria-label="Close skydiving photo" onClick={close}><span aria-hidden="true">×</span></button>
      </div>
      <p className="fun-photo-caption">Hongxiang · Skydiving</p>
    </div>
  </dialog>, document.body);
}
