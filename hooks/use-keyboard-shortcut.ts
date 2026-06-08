"use client"

import { useEffect, useCallback } from "react"

type KeyCombo = {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

/**
 * Hook to register global keyboard shortcuts.
 * Handles both Mac (⌘) and Windows (Ctrl) automatically.
 *
 * @example
 * useKeyboardShortcut({ key: "k", metaKey: true }, () => openCommandPalette())
 */
export function useKeyboardShortcut(
  combo: KeyCombo,
  callback: (e: KeyboardEvent) => void,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Exception: still trigger for ⌘K (command palette) even in inputs
        if (combo.key.toLowerCase() !== "k") return
      }

      const metaOrCtrl = combo.metaKey || combo.ctrlKey
      const isMetaOrCtrlPressed = e.metaKey || e.ctrlKey

      if (metaOrCtrl && !isMetaOrCtrlPressed) return
      if (combo.shiftKey && !e.shiftKey) return
      if (combo.altKey && !e.altKey) return
      if (e.key.toLowerCase() !== combo.key.toLowerCase()) return

      e.preventDefault()
      e.stopPropagation()
      callback(e)
    },
    [combo, callback, enabled]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}
