import React from 'react';

/**
 * Blue Theme Auth Background
 * - Base --bg with 3 large, heavily blurred circular color blobs:
 *   --blob-1 (bottom-left)
 *   --blob-2 (top-right)
 *   --blob-3 (bottom-right)
 * - Faint 24px dot grid fading out with a radial mask
 * - Pure CSS variables, zero purple/pink/peach, pointer-events: none, z-index: 0
 */
export default function AuthBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Base Background with CSS token --bg */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        {/* Blob 1: Bottom-Left (--blob-1) */}
        <div
          className="absolute -bottom-28 -left-24 w-[640px] h-[640px] rounded-full blur-[110px] sm:blur-[130px] opacity-80 transition-colors duration-300"
          style={{ backgroundColor: 'var(--blob-1)' }}
          aria-hidden="true"
        />

        {/* Blob 2: Top-Right (--blob-2) */}
        <div
          className="absolute -top-24 -right-16 w-[620px] h-[620px] rounded-full blur-[110px] sm:blur-[130px] opacity-80 transition-colors duration-300"
          style={{ backgroundColor: 'var(--blob-2)' }}
          aria-hidden="true"
        />

        {/* Blob 3: Bottom-Right (--blob-3) */}
        <div
          className="absolute -bottom-24 right-1/12 w-[560px] h-[560px] rounded-full blur-[100px] sm:blur-[120px] opacity-70 transition-colors duration-300"
          style={{ backgroundColor: 'var(--blob-3)' }}
          aria-hidden="true"
        />
      </div>

      {/* 2. Faint Dot Grid Pattern (~24px spacing, 10-15% opacity with radial mask) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15 dark:opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="blue-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="var(--primary)" opacity="0.6" />
          </pattern>
          <radialGradient id="dot-grid-fade" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <mask id="dot-grid-mask">
            <rect width="100%" height="100%" fill="url(#dot-grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#blue-dot-grid)" mask="url(#dot-grid-mask)" />
      </svg>
    </div>
  );
}
