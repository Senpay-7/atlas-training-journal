import type { Session, XPEvent } from './models';

export function levelFromXP(total: number) {
  if (!Number.isSafeInteger(total) || total < 0 || total > 1e9) throw new Error('Invalid XP total');
  let level = 1, current = total;
  let required = 100;
  while (current >= required) {
    current -= required;
    level += 1;
    required = Math.round(100 * level ** 1.35);
  }
  return { level, current, required, total, fraction: current / required };
}
// A local game rule, not a measure of physiology. One reward per training date.
export function workoutReward(session: Session, sessions: Session[], events: XPEvent[]): XPEvent {
  const rewardedThatDay = events.some(e => sessions.some(s => s.id === e.sessionId && s.date === session.date));
  return { id: `workout:${session.id}`, sessionId: session.id, amount: rewardedThatDay ? 0 : 100, ruleVersion: 1 };
}
