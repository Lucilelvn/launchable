import { FREE_ASSESSMENT_LIMIT, STORAGE_KEY_USAGE, STORAGE_KEY_PREMIUM } from './constants';

export function getUsageCount(): number {
  const stored = localStorage.getItem(STORAGE_KEY_USAGE);
  return stored ? parseInt(stored, 10) : 0;
}

export function incrementUsage(): number {
  const count = getUsageCount() + 1;
  localStorage.setItem(STORAGE_KEY_USAGE, String(count));
  return count;
}

function isLocalhost(): boolean {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

export function hasReachedFreeLimit(): boolean {
  if (isLocalhost()) return false;
  if (isPremium()) return false;
  return getUsageCount() >= FREE_ASSESSMENT_LIMIT;
}

export function isPremium(): boolean {
  return localStorage.getItem(STORAGE_KEY_PREMIUM) === 'true';
}

export function setPremium(value: boolean): void {
  localStorage.setItem(STORAGE_KEY_PREMIUM, String(value));
}
