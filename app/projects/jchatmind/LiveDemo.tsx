"use client";

import { useEffect, useRef, useState } from "react";

export default function LiveDemo({ url }: { url?: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const region = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open || !url) return;
    const timer = setTimeout(() => setSlow(true), 15000);
    const ready = (event: MessageEvent) => {
      if (event.source === frame.current?.contentWindow && event.origin === new URL(url).origin && event.data?.type === "jchatmind:ready") {
        setLoaded(true); setSlow(false); clearTimeout(timer);
      }
    };
    window.addEventListener("message", ready);
    return () => { clearTimeout(timer); window.removeEventListener("message", ready); };
  }, [open, url, attempt]);
  useEffect(() => { if (open) region.current?.scrollIntoView({ block: "start", behavior: "smooth" }); }, [open]);
  return <>
    <button className="jcm-experience-entry" type="button" aria-expanded={open} aria-controls="live-demo" onClick={() => setOpen(value => !value)}><span className="jcm-entry-symbol" aria-hidden="true">✦</span><span>Explore the demo<small>Guided experience · Real AI</small></span><span aria-hidden="true">{open ? "−" : "↗"}</span></button>
    {open && <section ref={region} className="jcm-live" id="live-demo" aria-label="Try JChatMind live">
      <div className="jcm-live-heading"><div><h2>Try it yourself.</h2><p>Choose a journey. Edit a question. See the answer generated live.</p></div>{url && <a href={url} target="_blank" rel="noreferrer">Open full screen ↗</a>}</div>
      {url ? <>
        {!loaded && <p className="jcm-live-loading" role="status">{slow ? "The live demo is taking longer to connect." : "Connecting to JChatMind…"} {slow && <button type="button" onClick={() => { setLoaded(false); setSlow(false); setAttempt(value => value + 1); }}>Reconnect</button>}</p>}
        <iframe key={attempt} ref={frame} src={url} title="JChatMind live OrbitDesk chat" sandbox="allow-scripts allow-same-origin allow-forms" referrerPolicy="no-referrer" />
      </> : <div className="jcm-live-unavailable"><strong>The live experience is being prepared.</strong><p>You can explore the recorded conversation below while the live service is being connected.</p><a href="#demo">View the interactive replay ↓</a></div>}
    </section>}
  </>;
}
