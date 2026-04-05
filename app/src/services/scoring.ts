/**
 * Signal scoring engine.
 *
 * Each signal type has a base weight. Recency decays over 90 days.
 * Final prospect score is capped at 100.
 */

export const SIGNAL_WEIGHTS: Record<string, number> = {
  JOB_POSTING: 10,
  FUNDING_ROUND: 25,
  EXPANSION: 20,
  LEADERSHIP_HIRE: 15,
  LAYOFF_RECOVERY: 12,
  CONTRACT_WIN: 18,
};

export interface SignalInput {
  type: string;
  strength: number;
  detectedAt: Date;
}

export function scoreProspect(signals: SignalInput[]): number {
  const now = Date.now();
  let score = 0;

  for (const s of signals) {
    const weight = SIGNAL_WEIGHTS[s.type] || 10;
    const ageMs = now - s.detectedAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recencyDecay = Math.max(0, 1 - ageDays / 90);
    score += weight * s.strength * recencyDecay;
  }

  return Math.min(100, Math.round(score * 10) / 10);
}
