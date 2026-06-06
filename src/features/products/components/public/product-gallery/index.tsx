'use client'

import { ImageCarousel } from './image-carousel'
import { VideoPlayer } from './video-player'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Image, Video } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  videos?: string[]
}

export function ProductGallery({ images, videos = [] }: ProductGalleryProps) {
  const hasImages = images.length > 0
  const hasVideos = videos.length > 0

  if (!hasImages && !hasVideos) {
    return (
      <div className="aspect-[4/3] rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
        No media available
      </div>
    )
  }

  if (!hasVideos) {
    return <ImageCarousel images={images} />
  }

  if (!hasImages) {
    return <VideoPlayer src={videos[0]} />
  }

  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="images" className="gap-2">
          <Image className="w-4 h-4" />
          Images ({images.length})
        </TabsTrigger>
        <TabsTrigger value="videos" className="gap-2">
          <Video className="w-4 h-4" />
          Videos ({videos.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="images">
        <ImageCarousel images={images} />
      </TabsContent>
      <TabsContent value="videos">
        <div className="space-y-4">
          {videos.map((video, index) => (
            <VideoPlayer key={index} src={video} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
