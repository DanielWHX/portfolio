"use client";

import { useState } from "react";

export default function LiveDemo({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  return <section className="jcm-live" id="live-demo" aria-label="Try JChatMind live">
    <div className="jcm-live-heading"><h2>Try it yourself.</h2><a href={url} target="_blank" rel="noreferrer">Open full screen ↗</a></div>
    {!loaded && <p className="jcm-live-loading" role="status">Loading the live demo…</p>}
    <iframe src={url} title="JChatMind live OrbitDesk chat" sandbox="allow-scripts allow-same-origin allow-forms" referrerPolicy="no-referrer" onLoad={() => setLoaded(true)} />
  </section>;
}
