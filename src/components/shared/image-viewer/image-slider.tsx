"use client"

/**
 * ImageSlider Component
 *
 * Full-screen image viewer with thumbnail navigation, keyboard controls,
 * and download functionality. Adapted from primeeditz-app.
 *
 * Changes from original:
 * - Replaced next/image with @unpic/react Image
 * - Updated for TanStack Start compatibility
 */

import { Image } from '@unpic/react'
import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

interface ImageSliderProps {
  images: Array<{
    url: string
    fileName: string
    fileId: string
  }>
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload?: (fileId: string, fileName: string, url: string) => void
}

export function ImageSlider({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
  onDownload,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [imageKey, setImageKey] = useState(0)
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setImageError(false)
      setIsZoomed(false)
      setIsImageLoading(true)
    }
  }, [open, initialIndex])

  useEffect(() => {
    if (thumbnailRefs.current[currentIndex]) {
      thumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [currentIndex])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : images.length - 1
          setImageError(false)
          setIsZoomed(false)
          setIsImageLoading(true)
          setImageKey((prevKey) => prevKey + 1)
          return newIndex
        })
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => {
          const newIndex = prev < images.length - 1 ? prev + 1 : 0
          setImageError(false)
          setIsZoomed(false)
          setIsImageLoading(true)
          setImageKey((prevKey) => prevKey + 1)
          return newIndex
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, images.length, onOpenChange])

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : images.length - 1
      setImageError(false)
      setIsZoomed(false)
      setIsImageLoading(true)
      setImageKey((prevKey) => prevKey + 1)
      return newIndex
    })
  }

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev < images.length - 1 ? prev + 1 : 0
      setImageError(false)
      setIsZoomed(false)
      setIsImageLoading(true)
      setImageKey((prevKey) => prevKey + 1)
      return newIndex
    })
  }

  const handleDownload = () => {
    const currentImage = images[currentIndex]
    if (currentImage && onDownload) {
      onDownload(currentImage.fileId, currentImage.fileName, currentImage.url)
    }
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
    setImageError(false)
    setIsZoomed(false)
    setIsImageLoading(true)
    setImageKey((prev) => prev + 1)
  }

  const handleRefresh = () => {
    setImageError(false)
    setIsImageLoading(true)
    setImageKey((prev) => prev + 1)
  }

  const currentImage = images[currentIndex]

  // Calculate which thumbnails to show (3-4 thumbnails around current index)
  const getVisibleThumbnails = () => {
    const maxThumbnails = 4
    const totalImages = images.length

    if (totalImages <= maxThumbnails) {
      return images.map((image, idx) => ({
        image,
        index: idx,
      }))
    }

    let start = Math.max(0, currentIndex - Math.floor(maxThumbnails / 2))
    let end = start + maxThumbnails

    if (end > totalImages) {
      end = totalImages
      start = Math.max(0, end - maxThumbnails)
    }

    return images.slice(start, end).map((image, idx) => ({
      image,
      index: start + idx,
    }))
  }

  const visibleThumbnails = getVisibleThumbnails()

  if (images.length === 0) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="!h-screen !max-h-screen !mt-0 p-0 rounded-none">
        <div className="flex h-full flex-col bg-background">
          {/* Header */}
          <DrawerHeader className="shrink-0 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <DrawerTitle className="text-lg font-semibold">
                  {currentImage?.fileName || `Image ${currentIndex + 1}`}
                </DrawerTitle>
                <DrawerDescription className="mt-1">
                  {currentIndex + 1} of {images.length}
                </DrawerDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  className="h-8 w-8 rounded-full"
                  aria-label="Refresh image"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>

          {/* Main Content */}
          <div className="flex flex-1 items-center justify-center relative bg-black/50 overflow-hidden">
            {/* Left Navigation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-lg z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center h-full p-8">
              {currentImage && (
                <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
                  {imageError ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-sm">Failed to load image</p>
                    </div>
                  ) : (
                    <>
                      {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
                      {/* Using standard img for full-screen viewing - Unpic for thumbnails */}
                      <img
                        key={`${currentImage.fileId}-${imageKey}`}
                        src={currentImage.url}
                        alt={currentImage.fileName}
                        className={cn(
                          'max-w-full max-h-full object-contain transition-opacity duration-300',
                          isImageLoading ? 'opacity-0' : 'opacity-100',
                          isZoomed && 'cursor-zoom-out'
                        )}
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => {
                          setImageError(true)
                          setIsImageLoading(false)
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right Navigation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-lg z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Footer */}
          <DrawerFooter className="shrink-0 border-t px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>

              {/* Thumbnail Strip */}
              <div className="flex-1 flex items-center justify-center gap-2 px-4">
                <div className="flex gap-2">
                  {visibleThumbnails.map(({ image, index }) => (
                    <button
                      key={image.fileId}
                      ref={(el) => {
                        thumbnailRefs.current[index] = el
                      }}
                      onClick={() => handleThumbnailClick(index)}
                      className={cn(
                        'shrink-0 w-20 h-20 rounded-md border-2 overflow-hidden transition-all',
                        index === currentIndex
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {/* Unpic Image for optimized thumbnails */}
                      <Image
                        src={image.url}
                        alt={image.fileName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
                {onDownload && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                )}
              </div>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
