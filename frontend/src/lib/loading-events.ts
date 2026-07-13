export const LOADING_START_EVENT = 'dntech:loading-start';
export const LOADING_END_EVENT = 'dntech:loading-end';

export function startGlobalLoading() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(LOADING_START_EVENT));
}

export function endGlobalLoading() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(LOADING_END_EVENT));
}
