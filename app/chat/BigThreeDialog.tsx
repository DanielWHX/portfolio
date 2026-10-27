"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import BigThreeRecord from "./BigThreeRecord";
import PortfolioIcon from "./PortfolioIcon";

export default function BigThreeDialog({ id, onClose }: { id: string; onClose: () => void }) {
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

  return createPortal(<dialog id={id} ref={dialogRef} className="big-three-dialog chat-design-overlay" aria-label="Big Three Record"
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="big-three-dialog-toolbar">
      <button type="button" aria-label="Close Big Three Record" onClick={onClose}>
        <PortfolioIcon name="close" size={18} />
      </button>
    </div>
    <BigThreeRecord />
  </dialog>, document.body);
}
