"use client";

import { useId, useState, type CSSProperties } from "react";
import { fitnessProfile } from "@/lib/portfolio/fitness-profile";
import useGymGame from "./useGymGame";
import GymVideoDialog from "./GymVideoDialog";
import useGymImpact from "./useGymImpact";
import GymImpactCracks from "./SvgCracks";
import "./gym.css";
import "./gym-iron.css";

function PixelStar({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="m12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55-4.76-4.64 6.58-.96L12 2.5Z" /></svg>;
}

const liftInstructions = {
  squat: "Find your feet. Then reach for the stars.",
  bench: "A little less keyboard. A little more bench.",
  deadlift: "Heavy lifting, away from the codebase.",
};

export default function TopGymCard({ theme = "iron" }: { theme?: "arcade" | "iron" }) {
  const helpId = useId();
  const [videoOpen, setVideoOpen] = useState(false);
  const [impactEnabled, setImpactEnabled] = useState(true);
  const game = useGymGame();
  const impactRef = useGymImpact({ enabled: impactEnabled && theme === "iron", charging: game.phase === "charging", successToken: game.phase === "success" ? `${game.liftId}:${game.count}` : null, theme, suspended: videoOpen });
  const lift = fitnessProfile.lifts.find(item => item.id === game.liftId) ?? fitnessProfile.lifts[0];
  const resting = game.activity === "rest";
  const holding = game.phase === "charging";
  const targetZone = theme === "iron" ? "target" : "mint";
  const actionLabel = game.complete ? "Start another set" : holding ? `Release in the ${targetZone} zone` : game.phase === "lifting" ? "Up it goes!" : "Hold to lift";
  const feedback = resting ? "Recovery is part of the game. Take a breath."
    : game.complete ? "Set complete! Three stars, well earned."
    : game.phase === "success" ? `Nice lift! ${game.count} of 3 reps. Keep it going.`
    : game.phase === "miss" ? game.power < 65 ? `A little early! Hold until the ${targetZone} zone.` : "Too much power! Release a little sooner."
    : holding ? `Steady… release when the marker reaches the ${targetZone} zone.`
    : game.phase === "lifting" ? "You’ve got this."
    : liftInstructions[lift.id];

  const power = Math.round(game.power);
  const inZone = game.power >= 65 && game.power <= 90;

  return <article ref={impactRef} className="gym-card" aria-label="Big Three Record" data-theme={theme} data-activity={game.activity} data-phase={game.phase}>
    <header className="gym-heading">
      <h2 className="gym-total"><span>THE BIG THREE</span><strong>{fitnessProfile.totalKg}<small> kg</small></strong></h2>
      {theme === "iron" && <label className="gym-impact-toggle"><input type="checkbox" checked={impactEnabled} onChange={event => setImpactEnabled(event.target.checked)} aria-label="Screen impact" /><span>Impact</span></label>}
    </header>

    <div className="gym-records" role="group" aria-label="Choose a lift">
      {fitnessProfile.lifts.map((item, index) => <button type="button" key={item.id} className="gym-record" aria-pressed={game.activity === item.id} onClick={() => game.select(item.id)}>
        <span className="gym-record-index">0{index + 1}</span><span className="gym-record-name">{item.label}</span><strong>{item.weightKg}<small> kg</small></strong>
      </button>)}
    </div>

    <div className="gym-room" role="group" aria-label={resting ? "Pixel Kirby taking a break in a little gym" : `Pixel Kirby training ${lift.label.toLowerCase()}`}>
      <div className="gym-window" aria-hidden="true"><i /><i /><span /></div>
      <div className="gym-wall-sign" aria-hidden="true">HONGXIANG’S<br /><b>OFFLINE CLUB</b></div>
      <div className="gym-wall-clock" aria-hidden="true"><i /><span /></div>
      <div className="gym-rack" aria-hidden="true"><i /><i /><i /><span /><span /><span /></div>
      <div className="gym-plant" aria-hidden="true"><i /><span /><b /></div>
      <button type="button" className="gym-tv" aria-label={`Watch ${lift.label} video`} onClick={() => { game.cancelHold(); setVideoOpen(true); }}>
        <span className="gym-tv-screen" aria-hidden="true"><span className="gym-play-triangle" /><b>REAL LIFTS</b><small>PRESS PLAY</small></span><i aria-hidden="true" /><span className="gym-tv-stand" aria-hidden="true" />
      </button>
      <div className="gym-floor" aria-hidden="true" />
      <div className="gym-mat" aria-hidden="true" />
      <div className="gym-character-shadow" aria-hidden="true" />
      <div className="gym-lifter" aria-hidden="true" style={{ "--power": game.power / 100 } as CSSProperties}>
        <img className="gym-sprite gym-sprite-idle" src="/gym/kirby-idle.png" alt="" width="1024" height="1024" draggable={false} />
        <img className="gym-sprite gym-sprite-action" src={`/gym/kirby-${lift.id}${lift.id === "bench" ? "-down" : ""}.png`} alt="" width="1024" height="1024" draggable={false} />
        <img className="gym-sprite gym-sprite-finish" src={`/gym/kirby-${lift.id}${lift.id === "bench" ? "" : "-up"}.png`} alt="" width="1024" height="1024" draggable={false} />
        <div className="gym-rest-bubble">z<span>z</span><small>z</small></div>
      </div>
      <div className="gym-sparkles" aria-hidden="true" key={`${game.activity}-${game.count}`}>{[0, 1, 2, 3, 4].map(n => <span key={n} style={{ "--i": n } as CSSProperties}><PixelStar filled /></span>)}</div>
      <GymImpactCracks />
      <div className="gym-room-label" aria-hidden="true"><span className="gym-live-dot" />{resting ? "REST MODE" : `${lift.label.toUpperCase()} · ${lift.weightKg} KG`}</div>
      <span className="gym-room-coordinate" aria-hidden="true">EST. OFF THE CLOCK</span>
    </div>

    <div className="gym-console">
      <div className="gym-set-row"><span className="gym-console-label">{resting ? "RECOVERY MODE" : "THREE REPS. ONE SET."}</span><div className="gym-rep-stars" aria-label={`${game.count} of 3 reps completed`}>{[1, 2, 3].map(rep => <span key={rep} className={game.count >= rep ? "is-filled" : ""}><PixelStar filled={game.count >= rep} /></span>)}</div></div>
      <p className="gym-feedback" role="status" aria-live="polite">{feedback}</p>
      {!resting ? <>
        <div className="gym-control-deck">
          <div className="gym-meter-module" data-in-zone={inZone}>
            <div className="gym-meter-readout" aria-hidden="true"><span>{game.complete ? "SET COMPLETE" : inZone ? "RELEASE NOW" : "POWER"}</span><strong>{power}<small>%</small></strong></div>
            <div className="gym-meter" role="progressbar" aria-label="Lift power" aria-valuemin={0} aria-valuemax={100} aria-valuenow={power} aria-valuetext={`${power} percent. Release between 65 and 90 percent.`}>
              <div className="gym-meter-segments" aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} data-lit={game.power >= (index + 1) * 5} data-target={index >= 13 && index < 18} />)}</div>
              <div className="gym-meter-zone" aria-hidden="true"><span>RELEASE</span></div><span className="gym-meter-tick" style={{ left: `${Math.min(98, game.power)}%` }} />
            </div>
            <div className="gym-meter-scale" aria-hidden="true"><span>0</span><span>65–90 · SWEET SPOT</span><span>100</span></div>
          </div>
          <div className="gym-action-station">
          <button type="button" className="gym-lift-button" disabled={game.phase === "lifting"} aria-label={actionLabel} aria-describedby={helpId} data-held={holding}
            onPointerDown={event => { if (event.button !== 0 || !event.isPrimary) return; event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); if (game.beginHold(`pointer:${event.pointerId}`)) event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerUp={event => { if (event.button === 0) game.releaseHold(`pointer:${event.pointerId}`); }} onPointerCancel={event => game.cancelHold(`pointer:${event.pointerId}`)} onLostPointerCapture={event => game.cancelHold(`pointer:${event.pointerId}`)}
            onKeyDown={event => { if (![" ", "Enter"].includes(event.key)) return; event.preventDefault(); if (event.repeat) return; if (game.complete) game.newSet(); else game.beginHold(`key:${event.key}`); }}
            onKeyUp={event => { if ([" ", "Enter"].includes(event.key)) { event.preventDefault(); game.releaseHold(`key:${event.key}`); } }}
            onBlur={() => game.cancelHold()} onClick={game.newSet}>
            <span className="gym-button-face" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{game.complete ? <path d="M24 10a11 11 0 1 0 2 10M24 4v7h-7" /> : <><path d="M7 11v10m18-10v10M3 13v6m26-6v6M7 16h18M11 10l5-5 5 5m-5-5v11" /></>}</svg><span>{game.complete ? "AGAIN" : holding ? "RELEASE" : game.phase === "lifting" ? "LIFTING" : "HOLD"}</span></span>
          </button>
          <button type="button" className="gym-rest-button" aria-label="Take a breather" onClick={() => game.select("rest")}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 5h3v10H5zm7 0h3v10h-3z" /></svg><span>REST</span></button>
          </div>
        </div>
        <p id={helpId} className="gym-sr-only">Hold with mouse, touch, Space or Enter. Release in the {targetZone} zone. Three reps make a set.</p>
      </> : <div className="gym-rest-content"><p>Off the keyboard, I enjoy strength training.<br />Squat 200 kg · Bench 160 kg · Deadlift 200 kg.</p><button type="button" className="gym-lift-button" onClick={() => game.select(lift.id)}>Back to the bar <span aria-hidden="true">↗</span></button></div>}
    </div>
    {videoOpen && <GymVideoDialog lift={lift} onClose={() => setVideoOpen(false)} />}
  </article>;
}
