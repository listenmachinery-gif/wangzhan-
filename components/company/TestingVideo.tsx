"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

export function TestingVideo() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="border border-neutral-200 bg-[#0B0D10] p-3">
      <div className="relative aspect-video overflow-hidden bg-black">
        {isLoaded ? (
          <video
            controls
            preload="metadata"
            poster="/brand/factory-showcase.png"
            className="h-full w-full"
          >
            <source src="/brand/zyron-hero-video.mp4" type="video/mp4" />
            Your browser does not support the video element.
          </video>
        ) : (
          <>
            <Image
              src="/brand/factory-showcase.png"
              alt=""
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setIsLoaded(true)}
              aria-label="Load and play the ZYRON factory and machinery video"
              className="absolute inset-0 grid place-items-center bg-black/20 transition hover:bg-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#76B900]"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#76B900] text-[#0B0D10] shadow-xl sm:h-20 sm:w-20">
                <Play size={28} fill="currentColor" aria-hidden="true" />
              </span>
            </button>
          </>
        )}
      </div>
      <div className="px-2 py-4 text-white">
        <p className="text-lg font-semibold">See the Machine Run Before Shipment</p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Click to load the existing ZYRON video. Playback never starts
          automatically.
        </p>
      </div>
    </div>
  );
}
