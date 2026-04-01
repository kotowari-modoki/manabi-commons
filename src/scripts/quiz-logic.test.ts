// ABOUTME: Unit tests for quiz-logic.ts pure functions.
// ABOUTME: Covers answer checking and localStorage-based progress persistence.
import { describe, it, expect, beforeEach } from 'vitest';
import { checkAnswer, saveProgress, loadProgress } from './quiz-logic';

describe('checkAnswer', () => {
  it('returns true when selected index matches correct index', () => {
    expect(checkAnswer(1, 1)).toBe(true);
  });

  it('returns false when selected index does not match correct index', () => {
    expect(checkAnswer(0, 1)).toBe(false);
  });

  it('returns false for negative index', () => {
    expect(checkAnswer(-1, 0)).toBe(false);
  });
});

describe('saveProgress / loadProgress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false for a question that has never been answered', () => {
    expect(loadProgress('q-unknown')).toBe(false);
  });

  it('returns true after saveProgress is called for that key', () => {
    saveProgress('q-math-1');
    expect(loadProgress('q-math-1')).toBe(true);
  });

  it('saving one key does not affect a different key', () => {
    saveProgress('q-math-1');
    expect(loadProgress('q-math-2')).toBe(false);
  });

  it('saving the same key twice keeps it as true', () => {
    saveProgress('q-math-1');
    saveProgress('q-math-1');
    expect(loadProgress('q-math-1')).toBe(true);
  });
});
