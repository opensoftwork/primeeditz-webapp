/**
 * Unsaved Changes Warning Hook
 * 
 * Prevents users from leaving the wizard with unsaved changes.
 * Uses beforeunload for browser close and navigation guards for in-app routing.
 */

"use client"

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  isDirty: boolean
  message?: string
}

/**
 * Hook to warn users about unsaved changes when navigating away.
 * 
 * @param options.isDirty - Whether there are unsaved changes
 * @param options.message - Custom warning message
 */
export function useUnsavedChanges({
  isDirty,
  message = 'You have unsaved changes. Are you sure you want to leave?',
}: UseUnsavedChangesOptions) {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  // Handle browser close/refresh (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        // Modern browsers ignore custom messages, but we still need to set returnValue
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, message])

  // Confirm navigation
  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation)
      setPendingNavigation(null)
    }
    setShowDialog(false)
  }, [pendingNavigation, router])

  // Cancel navigation
  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null)
    setShowDialog(false)
  }, [])

  // Safe navigation that checks for unsaved changes
  const safeNavigate = useCallback(
    (path: string) => {
      if (isDirty) {
        setPendingNavigation(path)
        setShowDialog(true)
        return false
      }
      router.push(path)
      return true
    },
    [isDirty, router]
  )

  return {
    showDialog,
    safeNavigate,
    confirmNavigation,
    cancelNavigation,
  }
}
