"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MusicVisualizerProps {
  isPlaying?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function MusicVisualizer({
  isPlaying = true,
  className,
  children,
}: MusicVisualizerProps) {
  const [bars, setBars] = useState<number[]>([]);
  const BAR_COUNT = 80;

  useEffect(() => {
    setBars(Array.from({ length: BAR_COUNT }, (_, i) => i));
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-[400px] h-[400px]",
        className,
      )}
    >
      {/* Central Circle Area */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="relative w-64 h-64 rounded-full bg-black border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-col justify-center overflow-hidden">
          {/* Inner contents (Text/Status) */}
          <div className="absolute inset-0 bg-linear-to-b from-zinc-900 to-black opacity-90" />
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {children}
          </div>
        </div>
      </div>

      {/* Visualizer Bars */}
      <div className="absolute inset-0 z-10">
        {bars.map((i) => {
          const rotation = (i * 360) / BAR_COUNT;
          // Calculate color based on rotation to match the image:
          // Image seems to go Blue -> Teal -> Green -> Yellow -> Red -> Pink -> Purple -> Blue
          // We can map 0-360 to HSL.
          // Let's offset it so top (0deg) is Blue. Blue is ~240.
          const hue = (rotation + 200) % 360;

          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 origin-bottom"
              style={{
                height: "50%", // Radius
                width: "4px",
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            >
              {/* The actual bar segment at the end of the radius */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300 ease-in-out",
                  isPlaying ? "animate-music-bar" : "",
                )}
                style={{
                  height: `${60 + Math.random() * 40}%`, // Ensure it starts from center and extends past the covering circle
                  backgroundColor: `hsl(${hue}, 100%, 60%)`, // More vibrant
                  boxShadow: `0 0 15px 2px hsl(${hue}, 100%, 60%)`, // Stronger glow
                  animationDelay: `-${Math.random() * 2}s`,
                  // We position it at the OUTER edge of the circle (which is at top of this container due to rotation)
                  // Wait, origin is center. "top-0" of the container (which is rotated) is the edge?
                  // No, we need to be careful with positioning.
                  // Let's try simpler: rotated container, bar is at `top: 0`.
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 blur-[60px] opacity-30 bg-indigo-500/20 rounded-full z-0" />
    </div>
  );
}
