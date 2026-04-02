// ABOUTME: Unit tests for animated-step-logic.ts pure functions.
// ABOUTME: Covers step navigation boundary conditions.
import { describe, it, expect } from 'vitest';
import { nextStep, prevStep, isLastStep, isFirstStep } from './animated-step-logic';

describe('nextStep', () => {
  it('advances from step 0 to step 1', () => {
    expect(nextStep(0, 3)).toBe(1);
  });

  it('advances from step 1 to step 2', () => {
    expect(nextStep(1, 3)).toBe(2);
  });

  it('does not advance past the last step', () => {
    expect(nextStep(2, 3)).toBe(2);
  });

  it('does not advance past a single-step sequence', () => {
    expect(nextStep(0, 1)).toBe(0);
  });

  it('returns 0 when total is 0 (degenerate case)', () => {
    expect(nextStep(0, 0)).toBe(0);
  });
});

describe('prevStep', () => {
  it('goes back from step 2 to step 1', () => {
    expect(prevStep(2)).toBe(1);
  });

  it('goes back from step 1 to step 0', () => {
    expect(prevStep(1)).toBe(0);
  });

  it('does not go before step 0', () => {
    expect(prevStep(0)).toBe(0);
  });
});

describe('isLastStep', () => {
  it('returns true when current equals total minus one', () => {
    expect(isLastStep(2, 3)).toBe(true);
  });

  it('returns false when not at last step', () => {
    expect(isLastStep(1, 3)).toBe(false);
  });

  it('returns true for a single-step sequence', () => {
    expect(isLastStep(0, 1)).toBe(true);
  });

  it('returns true when total is 0 (degenerate case)', () => {
    expect(isLastStep(0, 0)).toBe(true);
  });
});

describe('isFirstStep', () => {
  it('returns true when current is 0', () => {
    expect(isFirstStep(0)).toBe(true);
  });

  it('returns false when current is greater than 0', () => {
    expect(isFirstStep(1)).toBe(false);
  });
});
