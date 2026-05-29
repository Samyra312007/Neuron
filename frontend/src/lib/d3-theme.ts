import { useSyncExternalStore } from 'react';

function getDark() {
  return document.documentElement.classList.contains('dark');
}

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

export function useDark() {
  return useSyncExternalStore(subscribe, getDark, () => false);
}

export function cssVar(name: string): string {
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!val) return '#6b7280';
  const parts = val.split(/\s+/).filter(Boolean);
  if (parts.length === 3 && parts.every(p => !isNaN(Number(p)))) {
    return `rgb(${parts.join(',')})`;
  }
  return val;
}

export function cssVarAlpha(name: string, alpha: number): string {
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!val) return `rgba(107,114,128,${alpha})`;
  const parts = val.split(/\s+/).filter(Boolean);
  if (parts.length === 3 && parts.every(p => !isNaN(Number(p)))) {
    return `rgba(${parts.join(',')},${alpha})`;
  }
  return val;
}
