"use client";

import { useId, type CSSProperties } from "react";
import { fitnessProfile } from "@/lib/portfolio/fitness-profile";
import useGymGame from "./useGymGame";
import "./gym.css";

function PixelStar({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="m12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55-4.76-4.64 6.58-.96L12 2.5Z" /></svg>;
}

const liftInstructions = {
  squat: "Find your feet. Then reach for the stars.",
  bench: "A little less keyboard. A little more bench.",
  deadlift: "Heavy lifting, away from the codebase.",
};

export default function TopGymCard() {
  const helpId = useId();
  const game = useGymGame();
  const lift = fitnessProfile.lifts.find(item => item.id === game.liftId) ?? fitnessProfile.lifts[0];
  const resting = game.activity === "rest";
  const holding = game.phase === "charging";
  const actionLabel = game.complete ? "Start another set" : holding ? "Release in the mint zone" : game.phase === "lifting" ? "Up it goes!" : "Hold to lift";
  const feedback = resting ? "Recovery is part of the game. Take a breath."
    : game.complete ? "Set complete! Three stars, well earned."
    : game.phase === "success" ? `Nice lift! ${game.count} of 3 reps. Keep it going.`
    : game.phase === "miss" ? game.power < 65 ? "A little early! Hold until the mint zone." : "Too much power! Release a little sooner."
    : holding ? "Steady… release when the marker reaches mint."
    : game.phase === "lifting" ? "You’ve got this."
    : liftInstructions[lift.id];

  return <article className="gym-card" aria-label="TopGym" data-activity={game.activity} data-phase={game.phase}>
    <header className="gym-heading">
      <h2 className="gym-total"><span>THE BIG THREE</span><strong>{fitnessProfile.totalKg}<small> kg</small></strong></h2>
    </header>

    <div className="gym-records" role="group" aria-label="Choose a lift">
      {fitnessProfile.lifts.map((item, index) => <button type="button" key={item.id} className="gym-record" aria-pressed={game.activity === item.id} onClick={() => game.select(item.id)}>
        <span className="gym-record-index">0{index + 1}</span><span className="gym-record-name">{item.label}</span><strong>{item.weightKg}<small> kg</small></strong>
      </button>)}
    </div>

    <div className="gym-room" role="img" aria-label={resting ? "Pixel Kirby taking a break in a little gym" : `Pixel Kirby training ${lift.label.toLowerCase()}`}>
      <div className="gym-window" aria-hidden="true"><i /><i /><span /></div>
      <div className="gym-wall-sign" aria-hidden="true">HONGXIANG’S<br /><b>OFFLINE CLUB</b></div>
      <div className="gym-wall-clock" aria-hidden="true"><i /><span /></div>
      <div className="gym-rack" aria-hidden="true"><i /><i /><i /><span /><span /><span /></div>
      <div className="gym-plant" aria-hidden="true"><i /><span /><b /></div>
      <div className="gym-tv" aria-hidden="true"><div><span className="gym-play-triangle" /><b>REAL LIFTS</b><small>Clips coming soon</small></div><i /><span /></div>
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
      <div className="gym-room-label" aria-hidden="true"><span className="gym-live-dot" />{resting ? "REST MODE" : `${lift.label.toUpperCase()} · ${lift.weightKg} KG`}</div>
      <span className="gym-room-coordinate" aria-hidden="true">EST. OFF THE CLOCK</span>
    </div>

    <div className="gym-console">
      <div className="gym-set-row"><span className="gym-console-label">{resting ? "A MOMENT TO RECHARGE" : "YOUR MINI SET"}</span><div className="gym-rep-stars" aria-label={`${game.count} of 3 reps completed`}>{[1, 2, 3].map(rep => <span key={rep} className={game.count >= rep ? "is-filled" : ""}><PixelStar filled={game.count >= rep} /></span>)}</div></div>
      <p className="gym-feedback" role="status" aria-live="polite">{feedback}</p>
      {!resting ? <>
        <div className="gym-meter" role="progressbar" aria-label="Lift power" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(game.power)} aria-valuetext={`${Math.round(game.power)} percent. Release between 65 and 90 percent.`}>
          <div className="gym-meter-zone"><span>RELEASE</span></div><span className="gym-meter-tick" style={{ left: `${Math.min(98, game.power)}%` }} /><span className="gym-meter-cap" />
        </div>
        <div className="gym-actions">
          <button type="button" className="gym-lift-button" disabled={game.phase === "lifting"} aria-describedby={helpId}
            onPointerDown={event => { if (event.button !== 0 || !event.isPrimary) return; event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); if (game.beginHold(`pointer:${event.pointerId}`)) event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerUp={event => { if (event.button === 0) game.releaseHold(`pointer:${event.pointerId}`); }} onPointerCancel={event => game.cancelHold(`pointer:${event.pointerId}`)} onLostPointerCapture={event => game.cancelHold(`pointer:${event.pointerId}`)}
            onKeyDown={event => { if (![" ", "Enter"].includes(event.key)) return; event.preventDefault(); if (event.repeat) return; if (game.complete) game.newSet(); else game.beginHold(`key:${event.key}`); }}
            onKeyUp={event => { if ([" ", "Enter"].includes(event.key)) { event.preventDefault(); game.releaseHold(`key:${event.key}`); } }}
            onBlur={() => game.cancelHold()} onClick={game.newSet}>
            <span aria-hidden="true">{game.complete ? "↻" : "↑"}</span>{actionLabel}
          </button>
          <button type="button" className="gym-rest-button" onClick={() => game.select("rest")}><span aria-hidden="true">☕</span> Take a breather</button>
        </div>
        <p id={helpId} className="gym-sr-only">Hold with mouse, touch, Space or Enter. Release in the mint zone. Three reps make a set.</p>
      </> : <div className="gym-rest-content"><p>Off the keyboard, I enjoy strength training.<br />Squat 200 kg · Bench 160 kg · Deadlift 200 kg.</p><button type="button" className="gym-lift-button" onClick={() => game.select(lift.id)}>Back to the bar <span aria-hidden="true">↗</span></button></div>}
    </div>
  </article>;
}
