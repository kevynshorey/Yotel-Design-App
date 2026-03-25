'use client'

import type { DesignOption } from '@/engine/types'
import { storage } from '@/store/persistence'

const STORAGE_KEY = 'yotel-selected-option'

export function setSelectedOption(option: DesignOption): void {
  if (typeof window === 'undefined') return

  // Synchronous localStorage write for immediate UI reads
  localStorage.setItem(STORAGE_KEY, JSON.stringify(option))

  // Async IndexedDB write (non-blocking background task)
  void storage.set(STORAGE_KEY, option)

  window.dispatchEvent(new CustomEvent('design-option-changed'))
}

export function getSelectedOption(): DesignOption | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSelectedOption(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEY)

  // Async IndexedDB delete (non-blocking)
  void storage.delete(STORAGE_KEY)

  window.dispatchEvent(new CustomEvent('design-option-changed'))
}
