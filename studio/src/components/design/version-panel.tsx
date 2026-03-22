'use client'

import { useCallback, useEffect, useState } from 'react'
import { Clock, Download, Save, Trash2, X } from 'lucide-react'
import type { DesignOption } from '@/engine/types'
import {
  deleteVersion,
  getVersions,
  saveVersion,
  type SavedVersion,
} from '@/store/version-store'

interface VersionPanelProps {
  isOpen: boolean
  onClose: () => void
  onLoad: (option: DesignOption) => void
  currentOption: DesignOption | null
}

export function VersionPanel({
  isOpen,
  onClose,
  onLoad,
  currentOption,
}: VersionPanelProps) {
  const [versions, setVersions] = useState<SavedVersion[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setVersions(getVersions())
  }, [])

  useEffect(() => {
    if (isOpen) refresh()
  }, [isOpen, refresh])

  const handleSave = useCallback(() => {
    if (!currentOption) return
    saveVersion(currentOption)
    refresh()
  }, [currentOption, refresh])

  const handleDelete = useCallback(
    (id: string) => {
      deleteVersion(id)
      setConfirmDeleteId(null)
      refresh()
    },
    [refresh],
  )

  const handleLoad = useCallback(
    (version: SavedVersion) => {
      onLoad(version.option)
      onClose()
    },
    [onLoad, onClose],
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-slate-700/60 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-sky-400" />
          <span className="text-sm font-semibold text-slate-100">
            Version History
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <X size={14} />
        </button>
      </div>

      {/* Save current button */}
      <div className="border-b border-slate-800/60 px-4 py-3">
        <button
          onClick={handleSave}
          disabled={!currentOption}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save size={13} />
          Save Current Design
        </button>
        {!currentOption && (
          <p className="mt-1.5 text-center text-[10px] text-slate-500">
            Select a design option first
          </p>
        )}
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <Clock size={24} className="text-slate-600" />
            <p className="text-xs text-slate-500">No saved versions</p>
            <p className="text-[10px] text-slate-600">
              Save a design to compare later
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/40">
            {versions.map((v) => (
              <li key={v.id} className="group px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-200">
                      {v.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {new Date(v.timestamp).toLocaleString()}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                        {v.option.form}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {v.option.metrics.totalKeys} keys
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Score {v.option.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => handleLoad(v)}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-medium text-sky-400 transition-colors hover:bg-slate-700 hover:text-sky-300"
                  >
                    <Download size={10} />
                    Load
                  </button>
                  {confirmDeleteId === v.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="rounded bg-red-900/60 px-2 py-1 text-[10px] font-medium text-red-300 transition-colors hover:bg-red-900"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(v.id)}
                      className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-700 hover:text-red-400"
                    >
                      <Trash2 size={10} />
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/60 px-4 py-2">
        <p className="text-[10px] text-slate-600">
          {versions.length}/20 versions saved (local storage)
        </p>
      </div>
    </div>
  )
}
