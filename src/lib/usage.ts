import { FREE_ASSESSMENT_LIMIT, STORAGE_KEY_USAGE } from './constants';

export function getUsageCount(): number {
  const stored = localStorage.getItem(STORAGE_KEY_USAGE);
  return stored ? parseInt(stored, 10) : 0;
}

export function incrementUsage(): number {
  const count = getUsageCount() + 1;
  localStorage.setItem(STORAGE_KEY_USAGE, String(count));
  return count;
}

export function hasReachedFreeLimit(): boolean {
  return getUsageCount() >= FREE_ASSESSMENT_LIMIT;
}
