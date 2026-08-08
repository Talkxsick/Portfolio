'use client'
import { useSyncExternalStore } from 'react'

const MOBILE_QUERY = '(max-width: 768px)'

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

function getServerSnapshot() {
  return false
}

/**
 * Tracks whether the viewport currently matches a mobile-sized breakpoint.
 * SSR-safe: renders `false` on the server / first paint, then syncs
 * immediately on the client and stays in sync on resize/rotate.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

