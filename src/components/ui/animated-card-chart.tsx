"use client";

import * as React from "react";
import { useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility Function (from @/lib/utils) ---

/**
 * A utility function to conditionally join class names.
 * Requires `clsx` and `tailwind-merge` to be installed.
 * `npm install clsx tailwind-merge`
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Card Components ---

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AnimatedCard({ className, ...props }: CardProps) {
  return (
    <div
      role="region"
      aria-labelledby="card-title"
      aria-describedby="card-description"
      className={cn(
        "group/animated-card relative w-full overflow-hidden rounded-2xl border-2 border-zinc-950 bg-white shadow-[4px_4px_0px_0px_#9333ea] dark:border-zinc-800 dark:bg-black",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: CardProps) {
  return (
    <div
      role="group"
      className={cn(
        "flex flex-col space-y-1.5 border-t-2 border-zinc-950 p-4 dark:border-zinc-800",
        className
      )}
      {...props}
    />
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-black tracking-tight text-zinc-950 dark:text-white uppercase",
        className
      )}
      {...props}
    />
  );
}

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm font-medium text-neutral-500 dark:text-neutral-400",
        className
      )}
      {...props}
    />
  );
}

export function CardVisual({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("h-[200px] w-full flex items-center justify-center overflow-hidden", className)}
      {...props}
    />
  );
}

// --- Visual3 Component and its Sub-components ---

interface Visual3Props {
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
  badge1Text?: string;
  badge2Text?: string;
  hoverTitle?: string;
  hoverDesc?: string;
  trendData?: Array<{
    name: string;
    Pemasukan: number;
    Pengeluaran: number;
  }>;
}

export function Visual3({
  mainColor = "#9333ea",
  secondaryColor = "#10b981",
  gridColor = "#80808015",
  badge1Text = "+15,2%",
  badge2Text = "+18,7%",
  hoverTitle = "Visualisasi Tren Finansial",
  hoverDesc = "Fluktuasi arus kas 6 bulan terakhir.",
  trendData,
}: Visual3Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative h-[200px] w-full max-w-[480px] overflow-hidden rounded-t-xl flex items-center justify-center">
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={
          {
            "--color": mainColor,
            "--secondary-color": secondaryColor,
          } as React.CSSProperties
        }
      />

      <div className="relative h-[180px] w-[356px] overflow-hidden">
        <Layer4
          color={mainColor}
          secondaryColor={secondaryColor}
          hovered={hovered}
        />
        <Layer3 color={mainColor} />
        <Layer2 color={mainColor} hoverTitle={hoverTitle} hoverDesc={hoverDesc} />
        <Layer1 color={mainColor} secondaryColor={secondaryColor} badge1={badge1Text} badge2={badge2Text} />
        <EllipseGradient color={mainColor} />
        <GridLayer color={gridColor} />
      </div>
    </div>
  );
}

interface LayerProps {
  color: string;
  secondaryColor?: string;
  hovered?: boolean;
  badge1?: string;
  badge2?: string;
  hoverTitle?: string;
  hoverDesc?: string;
}

const GridLayer: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div
      style={{ "--grid-color": color } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 z-[4] h-full w-full bg-transparent bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:20px_20px] bg-center opacity-70 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"
    />
  );
};

const EllipseGradient: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 z-[5] flex h-full w-full items-center justify-center">
      <svg
        width="356"
        height="196"
        viewBox="0 0 356 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="356" height="180" fill="url(#paint0_radial_12_207)" />
        <defs>
          <radialGradient
            id="paint0_radial_12_207"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(178 98) rotate(90) scale(98 178)"
          >
            <stop stopColor={color} stopOpacity="0.25" />
            <stop offset="0.34" stopColor={color} stopOpacity="0.15" />
            <stop offset="1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

const Layer1: React.FC<LayerProps> = ({ color, secondaryColor, badge1 = "+15,2%", badge2 = "+18,7%" }) => {
  return (
    <div
      className="absolute top-4 left-4 z-[8] flex items-center gap-1.5"
      style={
        {
          "--color": color,
          "--secondary-color": secondaryColor,
        } as React.CSSProperties
      }
    >
      <div className="flex shrink-0 items-center rounded-full border border-zinc-950 bg-white/70 px-2 py-0.5 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 dark:border-zinc-700 dark:bg-black/60 shadow-[1px_1px_0px_0px_#000]">
        <div className="h-2 w-2 rounded-full bg-[var(--color)]" />
        <span className="ml-1.5 text-[11px] font-black text-black dark:text-white">
          {badge1}
        </span>
      </div>
      <div className="flex shrink-0 items-center rounded-full border border-zinc-950 bg-white/70 px-2 py-0.5 backdrop-blur-sm transition-opacity duration-300 ease-in-out group-hover/animated-card:opacity-0 dark:border-zinc-700 dark:bg-black/60 shadow-[1px_1px_0px_0px_#000]">
        <div className="h-2 w-2 rounded-full bg-[var(--secondary-color)]" />
        <span className="ml-1.5 text-[11px] font-black text-black dark:text-white">
          {badge2}
        </span>
      </div>
    </div>
  );
};

const Layer2: React.FC<{ color: string; hoverTitle?: string; hoverDesc?: string }> = ({
  color,
  hoverTitle = "Tren Finansial 6 Bulan",
  hoverDesc = "Arus kas pemasukan dan pengeluaran.",
}) => {
  return (
    <div
      className="group relative h-full w-[356px]"
      style={{ "--color": color } as React.CSSProperties}
    >
      <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[7] flex w-[356px] translate-y-full items-start justify-center bg-transparent p-4 transition-transform duration-500 group-hover/animated-card:translate-y-0">
        <div className="ease-[cubic-bezier(0.6, 0, 1)] rounded-xl border-2 border-zinc-950 bg-white/90 p-2 opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover/animated-card:opacity-100 dark:border-zinc-700 dark:bg-black/90 shadow-[3px_3px_0px_0px_#9333ea]">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color)]" />
            <p className="text-xs font-black text-black dark:text-white uppercase">
              {hoverTitle}
            </p>
          </div>
          {hoverDesc && (
            <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mt-0.5">
              {hoverDesc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Layer3: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[6] flex translate-y-full items-center justify-center opacity-0 transition-all duration-500 group-hover/animated-card:translate-y-0 group-hover/animated-card:opacity-100">
      <svg
        width="356"
        height="180"
        viewBox="0 0 356 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="356" height="180" fill="url(#paint0_linear_29_3)" />
        <defs>
          <linearGradient
            id="paint0_linear_29_3"
            x1="178"
            y1="0"
            x2="178"
            y2="180"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.35" stopColor={color} stopOpacity="0" />
            <stop offset="1" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const Layer4: React.FC<LayerProps> = ({ color, secondaryColor, hovered }) => {
  const rectsData = [
    {
      width: 15,
      height: 20,
      y: 110,
      hoverHeight: 20,
      hoverY: 130,
      x: 40,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: 20,
      y: 90,
      hoverHeight: 20,
      hoverY: 130,
      x: 60,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 40,
      y: 70,
      hoverHeight: 30,
      hoverY: 120,
      x: 80,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 30,
      y: 80,
      hoverHeight: 50,
      hoverY: 100,
      x: 100,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 30,
      y: 110,
      hoverHeight: 40,
      hoverY: 110,
      x: 120,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: 50,
      y: 110,
      hoverHeight: 20,
      hoverY: 130,
      x: 140,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: 50,
      y: 60,
      hoverHeight: 30,
      hoverY: 120,
      x: 160,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 30,
      y: 80,
      hoverHeight: 20,
      hoverY: 130,
      x: 180,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 20,
      y: 110,
      hoverHeight: 40,
      hoverY: 110,
      x: 200,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: 40,
      y: 70,
      hoverHeight: 60,
      hoverY: 90,
      x: 220,
      fill: color,
      hoverFill: color,
    },
    {
      width: 15,
      height: 30,
      y: 110,
      hoverHeight: 70,
      hoverY: 80,
      x: 240,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: 50,
      y: 110,
      hoverHeight: 50,
      hoverY: 100,
      x: 260,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: 20,
      y: 110,
      hoverHeight: 80,
      hoverY: 70,
      x: 280,
      fill: "currentColor",
      hoverFill: secondaryColor,
    },
    {
      width: 15,
      height: 30,
      y: 80,
      hoverHeight: 90,
      hoverY: 60,
      x: 300,
      fill: color,
      hoverFill: color,
    },
  ];

  return (
    <div className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] absolute inset-0 z-[8] flex h-[180px] w-[356px] items-center justify-center text-neutral-800/20 transition-transform duration-500 group-hover/animated-card:scale-125 dark:text-white/20">
      <svg width="356" height="180" xmlns="http://www.w3.org/2000/svg">
        {rectsData.map((rect, index) => (
          <rect
            key={index}
            width={rect.width}
            height={hovered ? rect.hoverHeight : rect.height}
            x={rect.x}
            y={hovered ? rect.hoverY : rect.y}
            fill={hovered ? rect.hoverFill : rect.fill}
            rx="3"
            ry="3"
            className="ease-[cubic-bezier(0.6, 0.6, 0, 1)] transition-all duration-500"
          />
        ))}
      </svg>
    </div>
  );
};
