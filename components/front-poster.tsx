"use client"

import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

const images = [
  "/images/boxing-training.png",
  "/images/strength-conditioning.png",
  "/images/gym-training.png",
]

export default function FrontPoster() {
  return (
    <div className="absolute inset-0">
      <Carousel opts={{ loop: true }} className="h-full">
        <CarouselContent>
          {images.map((src) => (
            <CarouselItem key={src} className="relative h-full">
              <Image src={src} alt="" fill className="object-cover opacity-50" priority />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="right-4 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  )
}
