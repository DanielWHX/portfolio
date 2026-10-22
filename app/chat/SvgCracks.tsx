const fractures = [
  "M500 310 475 303 459 309 430 292 412 298 376 276 350 279 322 262",
  "M462 309 452 326 422 337 401 333 374 350 337 353",
  "M430 292 426 273 407 262 403 243",
  "M500 310 524 297 545 301 570 280 589 282 617 261 650 253",
  "M570 280 579 260 570 249 582 228",
  "M500 310 530 320 550 317 579 337 606 333 635 350 665 352",
  "M579 337 578 358 603 372",
  "M500 310 494 331 507 346 499 367 510 383",
  "M499 367 479 369 468 381",
  "M500 310 506 287 496 270 502 250",
];

/** Decorative, code-drawn floor fractures. Visibility is owned by useGymImpact. */
export default function GymImpactCracks() {
  return <svg className="gym-impact-cracks" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <g className="gym-crack-highlight" fill="none" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" transform="translate(0 2)">
      {fractures.map(path => <path key={path} d={path} />)}
    </g>
    <g className="gym-crack-shadow" fill="none" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter">
      {fractures.map(path => <path key={path} d={path} />)}
    </g>
  </svg>;
}
