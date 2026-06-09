'use client'

import { useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface VideoPlayerProps {
  src: string
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setPlaying(!playing)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-background">
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={togglePlay}
          className="p-4 bg-card/80 rounded-full hover:bg-card transition-colors"
        >
          {playing ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8" />
          )}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
        <button onClick={toggleMute} className="p-2 bg-card/80 rounded-full hover:bg-card transition-colors">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button onClick={toggleFullscreen} className="p-2 bg-card/80 rounded-full hover:bg-card transition-colors ml-auto">
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
