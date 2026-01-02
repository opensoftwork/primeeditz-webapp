/**
 * useFileUploader Hook
 *
 * Manages file upload state including pending files, upload progress, and file operations.
 * Ported from primeeditz-app with no dependencies on Next.js.
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface PendingFile {
  id: string
  file: File
  previewUrl?: string
}

export interface UseFileUploaderOptions {
  maxFiles?: number
  onUploadError?: (error: string) => void
}

export function useFileUploader({
  maxFiles,
  onUploadError,
}: UseFileUploaderOptions = {}) {
  const [files, setFiles] = useState<PendingFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(
    new Map()
  )
  const [isUploading, setIsUploading] = useState(false)

  const addFiles = useCallback(
    (newFiles: File[]) => {
      // Normalize duplicates from the same selection (same name + size + lastModified)
      const uniqueNewFiles = newFiles.filter((file, index, self) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`
        return (
          self.findIndex(
            (f) => `${f.name}-${f.size}-${f.lastModified}` === key
          ) === index
        )
      })

      setFiles((prev) => {
        if (maxFiles && prev.length + uniqueNewFiles.length > maxFiles) {
          const error = `Maximum ${maxFiles} files allowed`
          onUploadError ? onUploadError(error) : toast.error(error)
          return prev
        }

        const existingKeys = new Set(
          prev.map(
            (f) => `${f.file.name}-${f.file.size}-${f.file.lastModified}`
          )
        )

        const deduped = uniqueNewFiles.filter((file) => {
          const key = `${file.name}-${file.size}-${file.lastModified}`
          return existingKeys.has(key) ? false : (existingKeys.add(key), true)
        })

        if (deduped.length === 0) {
          const message = 'Duplicate files skipped — already queued for upload'
          onUploadError ? onUploadError(message) : toast.info(message)
          return prev
        }

        const newPendingFiles = deduped.map((file) => ({
          id: Math.random().toString(36).substring(7),
          file,
          previewUrl: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        }))

        return [...prev, ...newPendingFiles]
      })
    },
    [maxFiles, onUploadError]
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearFiles = useCallback(() => {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
    setFiles([])
  }, [files])

  const updateProgress = useCallback((fileName: string, progress: number) => {
    setUploadProgress((prev) => new Map(prev).set(fileName, progress))
  }, [])

  const clearProgress = useCallback((fileName: string) => {
    setUploadProgress((prev) => {
      const next = new Map(prev)
      next.delete(fileName)
      return next
    })
  }, [])

  return {
    files,
    uploadProgress,
    isUploading,
    addFiles,
    removeFile,
    clearFiles,
    updateProgress,
    clearProgress,
    setIsUploading,
  }
}
