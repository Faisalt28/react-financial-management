"use client";

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMotionValue, animate, motion } from "motion/react";
import useMeasure from "react-use-measure";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export function MarqueeEffect({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentSpeed, setCurrentSpeed] = React.useState(speed);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    let controls: any;
    const size = direction === "horizontal" ? width : height;
    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    const distanceToTravel = Math.abs(to - from);
    const duration = distanceToTravel / (currentSpeed || 30);

    if (isTransitioning) {
      const remainingDistance = Math.abs(translation.get() - to);
      const transitionDuration = remainingDistance / (currentSpeed || 30);

      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: transitionDuration,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return () => controls?.stop();
  }, [
    key,
    translation,
    currentSpeed,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ]);

  const hoverProps = speedOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speedOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speed);
        },
      }
    : {};

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className={cn("flex", { "w-max": direction !== "vertical" })}
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// Curated high-resolution financial management & modern banking assets
const financialCards = [
  {
    url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80",
    tag: "「 01 // CASH FLOW 」",
    title: "Catatan Arus Kas",
  },
  {
    url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80",
    tag: "「 02 // TABUNGAN 」",
    title: "Target Finansial",
  },
  {
    url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
    tag: "「 03 // ANGGARAN 」",
    title: "Batas Pengeluaran",
  },
  {
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    tag: "「 04 // REKENING 」",
    title: "Dompet & Bank",
  },
  {
    url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
    tag: "「 05 // LAPORAN 」",
    title: "Analitik Bulanan",
  },
  {
    url: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80",
    tag: "「 06 // DANA DARURAT 」",
    title: "Pos Simpanan",
  },
];

export default function PromoSection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* 2D Manga Dot Screentone Accent (Pure solid purple dots - No gradient) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(#9333ea 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Manga Content Hero Column */}
          <header className="relative z-10 mx-auto max-w-xl text-center lg:mx-0 lg:text-start">
            {/* Manga 2D Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 text-white border-2 border-zinc-950 dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] mb-6">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>「 財務管理 // ACHEEZ 2.0 」</span>
            </div>

            {/* Sharp Headline */}
            <h1 className="mb-5 text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.1]">
              Kelola Finansial{" "}
              <span className="relative inline-block text-purple-600 dark:text-purple-400">
                Tanpa Bocor.
                <span className="absolute bottom-1 left-0 w-full h-1 bg-purple-600 -z-10 transform -rotate-1" />
              </span>
            </h1>

            {/* Concise Description (Not overwhelming) */}
            <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed mb-8">
              Buku kas modern dengan gaya 2D manga yang presisi. Pantau mutasi uang masuk & keluar, tetapkan batas anggaran ketat, serta setor tabungan impian dengan kontrol penuh.
            </p>

            {/* Manga Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide bg-purple-600 text-white border-2 border-zinc-950 dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:bg-purple-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer">
                    Buka Dashboard
                    <ArrowRight size={18} />
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide bg-purple-600 text-white border-2 border-zinc-950 dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:bg-purple-700 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer">
                      Mulai Sekarang — Gratis
                      <ArrowRight size={18} />
                    </button>
                  </Link>

                  <Link to="/login" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-950 dark:border-zinc-100 shadow-[4px_4px_0px_0px_#9333ea] hover:bg-zinc-100 dark:hover:bg-zinc-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#9333ea] transition-all cursor-pointer">
                      Masuk ke Akun
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Quick 2D Manga Badges */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center lg:justify-start gap-6 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-purple-600" />
                Database Cloud D1
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Zap size={16} className="text-purple-600" />
                Respon Super Cepat
              </span>
            </div>
          </header>

          {/* 2D Manga Visual Marquee Column */}
          <div
            className="relative grid h-[420px] sm:h-[500px] grid-cols-2 gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
          >
            {[
              { reverse: false, slice: financialCards.slice(0, 3) },
              { reverse: true, slice: financialCards.slice(3, 6) },
            ].map((mq, i) => (
              <MarqueeEffect
                key={i}
                gap={16}
                direction="vertical"
                reverse={mq.reverse}
                speed={28}
                speedOnHover={4}
              >
                {mq.slice.map((item, idx) => (
                  <figure
                    key={idx}
                    className="relative group rounded-2xl overflow-hidden border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_#9333ea] transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 transition-all duration-500"
                        loading="lazy"
                      />
                      {/* Manga Screentone Frame Overlay */}
                      <div className="absolute inset-0 bg-purple-900/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />

                      {/* 2D Manga Badge Overlay on Image */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-xl bg-white/95 dark:bg-zinc-950/95 border border-zinc-950 dark:border-zinc-100 shadow-[2px_2px_0px_0px_#9333ea] backdrop-blur-xs">
                        <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          {item.tag}
                        </p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </figure>
                ))}
              </MarqueeEffect>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { PromoSection };
