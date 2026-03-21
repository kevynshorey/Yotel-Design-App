'use client'

import type { DesignOption } from '@/engine/types'

const STORAGE_KEY = 'yotel-selected-option'

export function setSelectedOption(option: DesignOption): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(option))
    window.dispatchEvent(new CustomEvent('design-option-changed'))
  }
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
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('design-option-changed'))
  }
}
