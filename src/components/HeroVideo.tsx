import Image from 'next/image'

export default function HeroVideo() {
  return (
    <Image
      src="/media/parking-lot-aerial.jpg"
      alt="Professional asphalt parking lot with fresh sealcoating and line striping"
      fill
      priority
      className="hero-video"
      style={{ objectFit: 'cover' }}
    />
  )
}
