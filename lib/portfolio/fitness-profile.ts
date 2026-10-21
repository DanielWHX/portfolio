// Personal records explicitly supplied by Hongxiang; gameplay never changes them.
export const fitnessProfile = {
  tagline: "Strong typing. Heavy lifting.",
  source: "Shared directly by Hongxiang Wang",
  lifts: [
    { id: "squat", label: "Squat", weightKg: 200 },
    { id: "bench", label: "Bench press", weightKg: 160 },
    { id: "deadlift", label: "Deadlift", weightKg: 200 },
  ],
  totalKg: 560,
  recordsNote: "Self-reported lifts. 560 kg is the sum of these three lifts, not a verified competition total.",
  videoStatus: "not_provided",
  unsharedDetails: ["Body weight", "Training history", "Training frequency", "Competition results"],
} as const;

export type LiftId = (typeof fitnessProfile.lifts)[number]["id"];
