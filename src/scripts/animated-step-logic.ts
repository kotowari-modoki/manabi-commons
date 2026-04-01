// ABOUTME: Pure functions for AnimatedStep component navigation state.
// ABOUTME: All functions are stateless; the component owns the current step index.

export function nextStep(current: number, total: number): number {
  return Math.min(current + 1, total - 1);
}

export function prevStep(current: number): number {
  return Math.max(current - 1, 0);
}

export function isLastStep(current: number, total: number): boolean {
  return current === total - 1;
}

export function isFirstStep(current: number): boolean {
  return current === 0;
}
