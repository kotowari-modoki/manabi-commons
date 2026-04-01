// ABOUTME: Pure functions for AnimatedStep component navigation state.
// ABOUTME: All functions are stateless; the component owns the current step index.
// Precondition: total >= 1. Callers must not pass empty step arrays.

export function nextStep(current: number, total: number): number {
  const safeTotal = Math.max(total, 1);
  return Math.min(current + 1, safeTotal - 1);
}

export function prevStep(current: number): number {
  return Math.max(current - 1, 0);
}

export function isLastStep(current: number, total: number): boolean {
  const safeTotal = Math.max(total, 1);
  return current >= safeTotal - 1;
}

export function isFirstStep(current: number): boolean {
  return current === 0;
}
