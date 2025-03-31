import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Enhanced smooth scroll to element with customizable options
 * Provides a more refined scrolling experience with easing
 */
export function smoothScrollToElement(elementId: string, options?: {
  offsetPx?: number;  // Offset in pixels, useful for fixed headers
  duration?: number;  // Duration of animation in milliseconds
}) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const offset = options?.offsetPx ?? 80; // Default 80px offset for header
  const duration = options?.duration ?? 800; // Default 800ms duration
  
  const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;
  
  // Easing function for smoother animation
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  function scrollAnimation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);
    
    window.scrollTo(0, startPosition + distance * easeProgress);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(scrollAnimation);
    }
  }
  
  requestAnimationFrame(scrollAnimation);
}
