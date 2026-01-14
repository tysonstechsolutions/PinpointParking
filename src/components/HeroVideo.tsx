'use client'

import { useEffect, useRef } from 'react'

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Force play on mount (handles mobile browsers that block autoplay)
    const playVideo = async () => {
      try {
        await video.play()
      } catch (err) {
        // Autoplay failed - video will stay paused but that's okay
        // The dark background will show through the overlay
        console.log('Video autoplay prevented:', err)
      }
    }

    playVideo()

    // Also try to play when video becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo()
          }
        })
      },
      { threshold: 0.25 }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/media/parking-lot-aerial.jpg"
    >
      <source src="/media/sealcoating-video.mp4" type="video/mp4" />
    </video>
  )
}
