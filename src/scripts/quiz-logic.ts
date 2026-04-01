// ABOUTME: Pure functions for Quiz component state management.
// ABOUTME: Handles answer checking and localStorage-based progress persistence.

const STORAGE_KEY = 'manabi-quiz-progress';

export function checkAnswer(selectedIndex: number, correctIndex: number): boolean {
  return selectedIndex === correctIndex;
}

export function saveProgress(questionKey: string): void {
  const solved: Record<string, boolean> = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ?? '{}'
  );
  solved[questionKey] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
}

export function loadProgress(questionKey: string): boolean {
  const solved: Record<string, boolean> = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ?? '{}'
  );
  return solved[questionKey] === true;
}
