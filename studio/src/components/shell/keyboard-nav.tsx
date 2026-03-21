'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SHORTCUTS: Record<string, string> = {
  '1': '/design',
  '2': '/planning',
  '3': '/finance',
  '4': '/dataroom',
  '5': '/invest',
}

export function KeyboardNav() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const path = SHORTCUTS[e.key]
      if (path) {
        e.preventDefault()
        router.push(path)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return null
}
