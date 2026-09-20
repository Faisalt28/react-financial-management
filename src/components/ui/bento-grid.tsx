import { ReactNode, ElementType } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch",
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
      "group relative flex flex-col justify-between rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 transition-all duration-200",
      "bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#9333ea]",
      className
    )}
  >
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-2xl">
      {background}
    </div>

    <div className="relative z-10 flex flex-col justify-between flex-1 p-5 sm:p-6 transition-all duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border-2 border-zinc-950 dark:border-zinc-800 text-purple-600 dark:text-purple-400 font-bold shadow-[2px_2px_0px_0px_#9333ea] transition-transform duration-200 group-hover:scale-105">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mb-1 uppercase">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {children && (
        <div className="my-4 z-10">
          {children}
        </div>
      )}

      <div className="pt-3 mt-auto flex items-center justify-between border-t-2 border-zinc-100 dark:border-zinc-900">
        <Link
          to={href}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 uppercase tracking-wide group-hover:translate-x-0.5 transition-all py-1"
        >
          {cta}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  </div>
);

export { BentoCard, BentoGrid };

