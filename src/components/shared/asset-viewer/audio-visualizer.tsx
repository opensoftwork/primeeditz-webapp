"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  src: string;
  onLoadedData?: () => void;
  onError?: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// HSL to RGB conversion for rainbow colors
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function AudioVisualizer({
  src,
  onLoadedData,
  onError,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  // Initialize Web Audio API
  const initAudio = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;

    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128; // Smaller for linear bars
      analyser.smoothingTimeConstant = 0.85;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
    } catch (e) {
      console.error("Audio Context initialization failed", e);
    }
  }, []);

  // Canvas drawing loop - Linear Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      if (
        canvas.width !== rect.width * dpr ||
        canvas.height !== rect.height * dpr
      ) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const w = rect.width;
      const h = rect.height;

      // Pure black background matching the card design
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Get frequency data
      let dataArray: Uint8Array | null = null;
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray as any);
      }

      // ─── Draw Linear Waveform ───
      const barCount = 40;
      const barPadding = 4;
      const totalBarWidth = w * 0.7; // Use 70% of width for the waveform
      const barWidth = totalBarWidth / barCount - barPadding;
      const startX = (w - totalBarWidth) / 2;
      const centerY = h / 2;

      ctx.fillStyle = "#FFFFFF"; // Clean white/gray bars like in the image

      for (let i = 0; i < barCount; i++) {
        let freqValue = 0;
        if (dataArray && isPlaying) {
          const dataIndex = Math.floor((i / barCount) * dataArray.length);
          freqValue = dataArray[dataIndex] / 255;
        } else {
          // Subtle idle movement
          freqValue = 0.1 + Math.sin(Date.now() * 0.002 + i * 0.2) * 0.05;
        }

        const barHeight = Math.max(4, freqValue * (h * 0.4)); // Waveform height
        const x = startX + i * (barWidth + barPadding);

        // Draw bars symmetrical from the center (like the image)
        const roundness = barWidth / 2;
        ctx.beginPath();
        // Top half
        ctx.roundRect(
          x,
          centerY - barHeight / 2,
          barWidth,
          barHeight,
          roundness,
        );
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  // Audio event handlers
  const handlePlay = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!audioRef.current) return;
    initAudio();

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  return (
    <div className="relative group w-full h-full max-w-2xl aspect-video md:aspect-21/9 bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          onLoadedData?.();
        }}
        onTimeUpdate={(e) => {
          if (!isSeeking)
            setCurrentTime(
              e.currentTarget.duration ? e.currentTarget.currentTime : 0,
            );
        }}
        onEnded={() => setIsPlaying(false)}
        onError={() => onError?.()}
      />

      {/* Linear Waveform Canvas */}
      <canvas ref={canvasRef} className="w-full flex-1" onClick={handlePlay} />

      {/* Minimalism Controls Bar (shown on hover) */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-4 max-w-xl mx-auto">
          <button
            onClick={handlePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <span className="text-[10px] font-black tabular-nums text-white/40 shrink-0 min-w-[32px]">
            {formatTime(currentTime)}
          </span>

          <div className="flex-1 relative group/slider">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={() => setIsSeeking(false)}
              className="w-full h-1.5 appearance-none bg-white/10 rounded-full cursor-pointer accent-white"
            />
          </div>

          <span className="text-[10px] font-black tabular-nums text-white/40 shrink-0 min-w-[32px]">
            {formatTime(duration)}
          </span>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className="text-white/50 hover:text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
