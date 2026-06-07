'use client'

import { VideoPlayer } from './video-player'

interface CaseHeroVideoProps {
  videoUrl: string
  poster?: string
}

export function CaseHeroVideo({ videoUrl, poster }: CaseHeroVideoProps) {
  return (
    <div className="mb-6">
      <VideoPlayer url={videoUrl} poster={poster} />
    </div>
  )
}