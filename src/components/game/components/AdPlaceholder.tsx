"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { AdVisibilityResponse, adApi } from "../../../services/api";

interface AdPlaceholderProps {
  width: number;
  height: number;
  className?: string;
  children?: React.ReactNode;
  identifier?: string;
  onClick?: () => void;
}

export default function AdPlaceholder({
  width,
  height,
  className,
  children,
  onClick,
  identifier,
}: AdPlaceholderProps) {
  const [stats, setStats] = useState<AdVisibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const requestMadeRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const container = containerRef.current.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const aspectRatio = width / height;

      if (containerWidth < width) {
        const newWidth = containerWidth;
        const newHeight = newWidth / aspectRatio;
        setDimensions({ width: newWidth, height: newHeight });
      } else {
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [width, height]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      if (!identifier || requestMadeRef.current) return;

      requestMadeRef.current = true;
      setLoading(true);

      try {
        const data = await adApi.getVisibilityCount(identifier);
        setStats(data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to fetch ad stats:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    return () => {
      controller.abort();
    };
  }, [identifier]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={cn(
        "group relative flex items-center justify-center bg-[#FFB800]/10 border-2 border-dashed border-[#FFB800] text-[#FFB800] font-medium transition-colors hover:bg-[#FFB800]/20 cursor-pointer p-4 max-w-full",
        className
      )}
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      {children}

      {/* Tooltip */}
      {showTooltip && (stats || loading) && (
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 min-w-[280px] max-w-[90vw] bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-[#FFB800]/20 transform transition-all duration-200 ease-in-out z-50">
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/90 rotate-45 border-r border-b border-[#FFB800]/20" />

          {loading ? (
            <div className="h-4 w-3/4 bg-[#FFB800]/20 rounded animate-pulse mx-auto" />
          ) : (
            stats && (
              <p className="text-center text-sm text-white/90 px-2">
                Bugün toplam{" "}
                <span className="text-[#FFB800] font-bold">
                  {stats.uniqueViewers}
                </span>{" "}
                kişi{" "}
                <span className="text-[#FFB800] font-bold">
                  {stats.totalViews}
                </span>{" "}
                defa burayı gördü.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
