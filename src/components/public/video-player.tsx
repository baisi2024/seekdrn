'use client'

import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
  poster?: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
}

export function VideoPlayer({ 
  url, 
  poster, 
  controls = true, 
  autoplay = false, 
  loop = false 
}: VideoPlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={url}
        poster={poster}
        controls={controls}
        autoplay={autoplay}
        loop={loop}
        width="100%"
        height="100%"
        className="react-player"
        playing={autoplay}
      />
    </div>
  )
}