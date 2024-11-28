import React from "react";
import { cn } from "../../lib/utils";

interface LoaderProps {
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  text = "Loading...",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-[200px] gap-8",
        "animate-in fade-in-0 duration-1000",
        className
      )}
    >
      <div className="relative w-20 h-20">
        {/* Main spinner */}
        <div className="absolute w-full h-full border-4 border-primary rounded-full animate-spin border-t-transparent" />

        {/* Outer ring */}
        <div className="absolute -inset-2 border-4 border-secondary/20 rounded-full animate-pulse" />

        {/* Inner dot */}
        <div className="absolute inset-[30%] bg-primary/80 rounded-full animate-pulse" />
      </div>

      <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 duration-700">
        <span className="text-xl text-muted-foreground font-medium">
          {text}
        </span>
        <span className="flex gap-1">
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
        </span>
      </div>
    </div>
  );
};
