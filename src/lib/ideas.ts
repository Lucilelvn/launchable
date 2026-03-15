import { STORAGE_KEY_HISTORY } from './constants';
import type { SavedIdea } from '../types';

export function getSavedIdeas(): SavedIdea[] {
  const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as SavedIdea[];
  } catch {
    return [];
  }
}

export function saveIdea(idea: SavedIdea): void {
  const ideas = getSavedIdeas();
  // Replace if same id exists, otherwise prepend
  const index = ideas.findIndex((i) => i.id === idea.id);
  if (index >= 0) {
    ideas[index] = idea;
  } else {
    ideas.unshift(idea);
  }
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(ideas));
}

export function deleteIdea(id: string): void {
  const ideas = getSavedIdeas().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(ideas));
}
