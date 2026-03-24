'use client'

import { useCallback, useEffect, useState } from 'react'
import { AuditPanel } from './audit-panel'

/** Listens for `toggle-audit-panel` CustomEvent and renders the panel. */
export function AuditPanelWrapper() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-audit-panel', handler)
    return () => window.removeEventListener('toggle-audit-panel', handler)
  }, [])

  const handleClose = useCallback(() => setIsOpen(false), [])

  return <AuditPanel isOpen={isOpen} onClose={handleClose} />
}
