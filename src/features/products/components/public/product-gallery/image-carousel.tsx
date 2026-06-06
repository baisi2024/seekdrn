'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showZoom, setShowZoom] = useState(false)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (images.length === 0) return null

  return (
    <>
      <div className="relative">
        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={() => setShowZoom(true)}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={showZoom} onOpenChange={setShowZoom}>
        <DialogContent className="max-w-5xl p-0">
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-4 right-4 p-2 bg-white/80 rounded-full z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={images[currentIndex]}
            alt=""
            className="w-full h-auto max-h-[90vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
