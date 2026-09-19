import { ReactNode, ElementType } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: ElementType;
  description: string;
  href: string;
  cta: string;
  children?: ReactNode;
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  children,
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300",
      "bg-white shadow-xs hover:shadow-lg hover:border-zinc-300",
      "dark:bg-zinc-950 dark:hover:border-zinc-700 dark:[box-shadow:0_-20px_80px_-20px_#ffffff0f_inset]",
      className
    )}
  >
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {background}
    </div>

    <div className="relative z-10 flex flex-col justify-between h-full p-6 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-3">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-transform duration-300 group-hover:scale-105">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">
          {name}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {description}
        </p>
      </div>

      {children && (
        <div className="my-auto py-2 z-10">
          {children}
        </div>
      )}

      <div className="pt-3 mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900/80">
        <Link
          to={href}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-white hover:text-black dark:hover:text-zinc-200 transition-colors py-1"
        >
          {cta}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-0 transition-colors duration-300 group-hover:bg-black/[0.02] dark:group-hover:bg-white/[0.02]" />
  </div>
);

export { BentoCard, BentoGrid };
