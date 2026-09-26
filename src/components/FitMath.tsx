import React, { useRef, useEffect } from 'react';
import { MathView } from './MathView';

interface FitMathProps {
  content: string;
  block?: boolean;
  className?: string;
  sizeLevel?: 'normal' | 'large' | 'huge';
  minScale?: number;
}

/**
 * High-performance, zero-lag single-line math component.
 * Automatically fits wide formulas to container width without triggering React re-renders.
 */
export const FitMath: React.FC<FitMathProps> = React.memo(({
  content,
  block = false,
  className = '',
  sizeLevel = 'normal',
  minScale = 0.48,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const getSizeClasses = () => {
    switch (sizeLevel) {
      case 'huge':
        return 'text-xl sm:text-3xl md:text-4xl';
      case 'large':
        return 'text-lg sm:text-2xl md:text-3xl';
      default:
        return 'text-base sm:text-xl md:text-2xl';
    }
  };

  useEffect(() => {
    const el = contentRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    let rafId: number | null = null;

    const adjustScale = () => {
      if (!el || !container) return;
      // Temporarily clear transform for natural measurement
      el.style.transform = 'none';

      const containerWidth = container.clientWidth;
      const contentWidth = el.scrollWidth;

      if (containerWidth > 0 && contentWidth > containerWidth) {
        // Calculate safe scale factor
        const targetScale = Math.max(minScale, (containerWidth - 14) / contentWidth);
        el.style.transform = `scale(${targetScale.toFixed(3)})`;
      } else {
        el.style.transform = 'none';
      }
    };

    // Measure once via requestAnimationFrame so we don't block the main thread
    rafId = requestAnimationFrame(adjustScale);

    // Observe container resizes efficiently
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(adjustScale);
      });
      observer.observe(container);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
    };
  }, [content, sizeLevel, minScale]);

  return (
    <div
      ref={containerRef}
      className="w-full flex items-center justify-center overflow-x-auto overflow-y-hidden scrollbar-none py-1"
    >
      <div
        ref={contentRef}
        style={{
          transformOrigin: 'center center',
          whiteSpace: 'nowrap',
        }}
        className="inline-flex items-center justify-center will-change-transform"
      >
        <MathView
          content={content}
          block={block}
          className={`${getSizeClasses()} ${className}`}
        />
      </div>
    </div>
  );
});

FitMath.displayName = 'FitMath';
