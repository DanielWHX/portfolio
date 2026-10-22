"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import TopGymCard from "./TopGymCard";
import "./gym-dialog.css";

export default function GymExperienceDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(<dialog id={id} ref={dialogRef} className="gym-dialog" aria-label="Big Three Record" data-theme="iron" data-gym-impact-root
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="gym-dialog-toolbar">
      <span>Big Three Record</span>
      <button type="button" aria-label="Close Big Three Record" onClick={onClose}><span aria-hidden="true">×</span></button>
    </div>
    <div className="gym-dialog-content"><TopGymCard /></div>
  </dialog>, document.body);
}
