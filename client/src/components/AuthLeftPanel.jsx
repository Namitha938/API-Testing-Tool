import React from 'react';
import {
  FolderTree,
  CheckCircle2,
  Activity,
} from 'lucide-react';

/**
 * CSS VARIABLE COLOR MAPPING (Blue Theme Design Tokens):
 * --bg: Page base background color (#F3F7FC light / #0B1220 dark)
 * --surface: Card background, icon tile background (#FFFFFF light / #111A2C dark)
 * --border: Subtile 1px borders (#E1E5EA light / #223049 dark)
 * --text-heading: Logo, titles, headings (#0B1B33 light / #F1F5FB dark)
 * --text-body: Secondary descriptive text (#5B6B80 light / #9FB0C7 dark)
 * --primary: Raised center isometric tile face, alternating chart bars 1 & 3 (#0B63C5 light / #3B8BEB dark)
 * --primary-hover: Button hover state (#0A55A8 light / #2B7CE5 dark)
 * --primary-dark: 3D side layers & extrusion depth of raised tile (#08408A light / #124EA2 dark)
 * --accent-green: Circular floating success badge, alternating chart bars 2 & 4, logo mark (#6CC24A light / #7BD45A dark)
 * --accent-orange: Floating latency/clock icon square (#FF6A00 light / #FF7B1A dark)
 * --illus-panel-stroke: Outer glass dashboard border stroke (#C3D5EA light / #1E2D4A dark)
 * --illus-line-1: UI text placeholder bars, avatar dot (#D5E2F3 light / #1B2942 dark)
 * --illus-line-2: UI text secondary bars, header URL pill (#E3ECF7 light / #162238 dark)
 */
export default function AuthLeftPanel({ subtitle = 'ENTERPRISE API STUDIO' }) {
  return (
    <div className="hidden lg:flex flex-col justify-center items-start max-w-lg pr-6 xl:pr-10 space-y-6 z-10 select-none">
      {/* 1. Brand Logo & Wordmark (Theme-aware styling with --accent-green and --primary) */}
      <div className="flex items-center gap-3">
        {/* Rounded square logo mark in --accent-green */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md ring-4 ring-white/60 dark:ring-white/10 transition-transform duration-300"
          style={{ backgroundColor: 'var(--accent-green)' }}
        >
          <div className="w-4 h-4 rounded-xs border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-xs" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span
              className="font-extrabold text-2xl tracking-tight"
              style={{ color: 'var(--text-heading)' }}
            >
              PulseAPI
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs backdrop-blur-xs"
              style={{
                backgroundColor: 'var(--blob-1)',
                color: 'var(--primary)',
                borderColor: 'var(--illus-panel-stroke)',
              }}
            >
              STUDIO
            </span>
          </div>
          <span
            className="block text-[11px] font-semibold uppercase tracking-widest mt-0.5"
            style={{ color: 'var(--text-body)' }}
          >
            {subtitle}
          </span>
        </div>
      </div>

      {/* 2. Original Isometric Glass-Dashboard SVG Component (Pure CSS Tokens, Zero Purple/Pink) */}
      <div className="w-full relative flex items-center justify-center py-2">
        <svg
          viewBox="0 0 520 380"
          className="w-full h-auto max-w-[480px] overflow-visible drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Isometric Glass Dashboard Illustration"
        >
          <defs>
            {/* Filter: Soft Ambient Drop Shadow */}
            <filter id="iso-ambient-shadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#0B1B33" floodOpacity="0.10" />
            </filter>
            <filter id="iso-tile-shadow" x="-30%" y="-30%" width="170%" height="170%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0B1B33" floodOpacity="0.18" />
            </filter>
            <filter id="iso-badge-shadow" x="-30%" y="-30%" width="170%" height="170%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#166534" floodOpacity="0.20" />
            </filter>

            {/* Glass Surface Reflection Gradient */}
            <linearGradient id="iso-glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* BASE SHADOW LAYER UNDER PANEL */}
          <polygon
            points="260,82 470,192 260,322 50,202"
            fill="#0B1B33"
            fillOpacity="0.07"
            className="dark:fill-black dark:fill-opacity-35"
            transform="translate(0, 16)"
          />

          {/* MAIN ISOMETRIC GLASS PANEL (~30 degree tilt) */}
          <g filter="url(#iso-ambient-shadow)">
            {/* Left 3D Side Rim / Thickness */}
            <polygon
              points="50,198 260,318 260,326 50,206"
              fill="var(--illus-panel-stroke)"
              fillOpacity="0.75"
            />
            {/* Right 3D Side Rim / Thickness */}
            <polygon
              points="260,318 470,188 470,196 260,326"
              fill="var(--illus-panel-stroke)"
              fillOpacity="0.9"
            />

            {/* Top Glass Face */}
            <polygon
              points="260,78 470,188 260,318 50,198"
              fill="url(#iso-glass-grad)"
              className="dark:fill-[var(--surface)] dark:fill-opacity-80"
              stroke="var(--illus-panel-stroke)"
              strokeWidth="1.5"
            />

            {/* Inner Translucent Bevel / Inset Edge */}
            <polygon
              points="260,86 458,188 260,308 62,198"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.6"
              strokeWidth="1"
            />
          </g>

          {/* FAINT DASHBOARD UI (Avatar Dots, URL Header, Text Bars, Alternating Bar Chart) */}
          <g opacity="0.9">
            {/* Window control dots in isometric projection */}
            <circle cx="85" cy="186" r="3.5" fill="var(--primary)" fillOpacity="0.6" />
            <circle cx="97" cy="180" r="3.5" fill="var(--accent-green)" fillOpacity="0.7" />
            <circle cx="109" cy="174" r="3.5" fill="var(--accent-orange)" fillOpacity="0.7" />

            {/* Header URL bar pill in --illus-line-2 */}
            <polygon
              points="130,165 240,105 285,130 175,190"
              fill="var(--illus-line-2)"
              fillOpacity="0.7"
              stroke="var(--illus-panel-stroke)"
              strokeWidth="0.8"
            />

            {/* Left Sidebar placeholder bars in --illus-line-1 */}
            <polygon points="85,212 145,178 150,181 90,215" fill="var(--illus-line-1)" fillOpacity="0.8" />
            <polygon points="92,228 152,194 157,197 97,231" fill="var(--illus-line-1)" fillOpacity="0.6" />
            <polygon points="99,244 159,210 164,213 104,247" fill="var(--illus-line-2)" fillOpacity="0.5" />

            {/* User Avatar Circle */}
            <ellipse cx="104" cy="265" rx="6" ry="4" fill="var(--illus-line-1)" fillOpacity="0.9" />

            {/* Main Content: Row of rounded pills */}
            <polygon points="190,195 240,168 248,172 198,200" fill="var(--illus-line-2)" fillOpacity="0.8" />
            <polygon points="255,160 305,133 313,137 263,165" fill="var(--illus-line-2)" fillOpacity="0.8" />
            <polygon points="320,125 370,98 378,102 328,130" fill="var(--illus-line-2)" fillOpacity="0.8" />

            {/* Content Text Lines (rounded bars in --illus-line-1 and --illus-line-2) */}
            <polygon points="195,218 310,154 316,157 201,222" fill="var(--illus-line-1)" fillOpacity="0.7" />
            <polygon points="202,234 290,185 296,188 208,238" fill="var(--illus-line-2)" fillOpacity="0.6" />
            <polygon points="209,250 340,177 346,180 215,254" fill="var(--illus-line-2)" fillOpacity="0.5" />

            {/* Mini Bar Chart in Alternating --primary and --accent-green (Rising upward) */}
            <g transform="translate(340, 190)">
              {/* Bar 1 (--primary) */}
              <polygon points="0,0 12,-6 12,-20 0,-14" fill="var(--primary-dark)" />
              <polygon points="12,-6 24,-12 24,-26 12,-20" fill="var(--primary)" />
              <polygon points="0,-14 12,-20 24,-26 12,-20" fill="var(--primary)" fillOpacity="0.85" />

              {/* Bar 2 (--accent-green - Taller) */}
              <polygon points="22,-11 34,-17 34,-38 22,-32" fill="#5BA83C" />
              <polygon points="34,-17 46,-23 46,-44 34,-38" fill="var(--accent-green)" />
              <polygon points="22,-32 34,-38 46,-44 34,-38" fill="var(--accent-green)" fillOpacity="0.85" />

              {/* Bar 3 (--primary - Medium) */}
              <polygon points="44,-22 56,-28 56,-50 44,-44" fill="var(--primary-dark)" />
              <polygon points="56,-28 68,-34 68,-56 56,-50" fill="var(--primary)" />
              <polygon points="44,-44 56,-50 68,-56 56,-50" fill="var(--primary)" fillOpacity="0.85" />

              {/* Bar 4 (--accent-green - Highest) */}
              <polygon points="66,-33 78,-39 78,-66 66,-60" fill="#5BA83C" />
              <polygon points="78,-39 90,-45 90,-72 78,-66" fill="var(--accent-green)" />
              <polygon points="66,-60 78,-66 90,-72 78,-66" fill="var(--accent-green)" fillOpacity="0.9" />
            </g>
          </g>

          {/* LAYERED TRANSLUCENT PLATE BENEATH THE RAISED TILE */}
          <g transform="translate(220, 160)">
            <polygon
              points="40,-12 110,25 40,65 -30,28"
              fill="#FFFFFF"
              fillOpacity="0.45"
              className="dark:fill-white/10"
              stroke="var(--illus-panel-stroke)"
              strokeOpacity="0.7"
              strokeWidth="1.2"
            />
          </g>

          {/* 3. RAISED ROUNDED-SQUARE TILE IN --primary WITH --primary-dark SIDE LAYER & CURSOR */}
          <g className="animate-iso-tile">
            {/* Tile Ambient Shadow */}
            <polygon
              points="260,146 325,182 260,220 195,184"
              fill="var(--primary-dark)"
              fillOpacity="0.22"
              filter="url(#iso-tile-shadow)"
              transform="translate(0, 18)"
            />

            {/* Left 3D Side Layer (--primary-dark) */}
            <polygon
              points="195,184 260,220 260,232 195,196"
              fill="var(--primary-dark)"
            />
            {/* Right 3D Side Layer (--primary-dark) */}
            <polygon
              points="260,220 325,182 325,194 260,232"
              fill="var(--primary-dark)"
              fillOpacity="0.88"
            />

            {/* Top Tile Face (--primary) */}
            <polygon
              points="260,146 325,182 260,220 195,184"
              fill="var(--primary)"
              stroke="#FFFFFF"
              strokeOpacity="0.5"
              strokeWidth="1.4"
            />

            {/* Subtle Surface Sheen */}
            <path
              d="M210,175 L260,152 L310,180"
              stroke="#FFFFFF"
              strokeOpacity="0.45"
              strokeWidth="1.2"
              fill="none"
            />

            {/* Center API Execute / Lightning Icon on Tile */}
            <g transform="translate(250, 172)">
              <polygon
                points="11,-6 2,4 9,4 6,14 17,2 10,2"
                fill="#FFFFFF"
                fillOpacity="0.95"
              />
            </g>

            {/* White Cursor Arrow Floating on Top */}
            <g transform="translate(290, 142)">
              <polygon
                points="0,0 0,16 5,12 9,20 12,18 8,10 14,10"
                fill="#FFFFFF"
                stroke="var(--primary-dark)"
                strokeWidth="1.2"
                filter="url(#iso-ambient-shadow)"
              />
            </g>
          </g>

          {/* 4. CIRCULAR FLOATING SUCCESS BADGE IN --accent-green WITH WHITE CHECK MARK */}
          <g className="animate-iso-badge">
            <g transform="translate(360, 115)" filter="url(#iso-badge-shadow)">
              {/* Circular Badge Body in --accent-green */}
              <ellipse
                cx="20"
                cy="20"
                rx="22"
                ry="18"
                fill="var(--accent-green)"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              {/* White Check Mark */}
              <path
                d="M12,20 L18,25 L28,14"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Mini "200 OK" status indicator pill */}
              <rect
                x="3"
                y="32"
                width="34"
                height="12"
                rx="6"
                fill="#166534"
                fillOpacity="0.9"
                stroke="#FFFFFF"
                strokeWidth="0.8"
              />
              <text
                x="20"
                y="41"
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                200 OK
              </text>
            </g>
          </g>

          {/* 5. SMALL ORANGE CLOCK ICON SQUARE IN --accent-orange */}
          <g className="animate-iso-clock">
            <g transform="translate(100, 245)" filter="url(#iso-ambient-shadow)">
              {/* Translucent Glass Plate */}
              <polygon
                points="30,-10 65,10 30,30 -5,10"
                fill="var(--surface)"
                fillOpacity="0.85"
                stroke="var(--illus-panel-stroke)"
                strokeWidth="1.2"
              />
              {/* Mini Clock Icon in --accent-orange */}
              <circle
                cx="30"
                cy="10"
                r="7"
                stroke="var(--accent-orange)"
                strokeWidth="1.6"
                fill="#FFFFFF"
                fillOpacity="0.9"
              />
              <polyline
                points="30,6 30,10 33,12"
                stroke="var(--accent-orange)"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              {/* Latency text tag */}
              <rect
                x="15"
                y="24"
                width="30"
                height="11"
                rx="4"
                fill="var(--accent-orange)"
                fillOpacity="0.15"
                stroke="var(--accent-orange)"
                strokeWidth="0.8"
              />
              <text
                x="30"
                y="32"
                fill="var(--accent-orange)"
                fontSize="7"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                142ms
              </text>
            </g>
          </g>

          {/* 6. VERIFIED SECURE PILL (Upper-Left) */}
          <g className="animate-iso-badge" transform="translate(140, 85)">
            <rect
              x="0"
              y="0"
              width="56"
              height="18"
              rx="9"
              fill="var(--surface)"
              fillOpacity="0.85"
              stroke="var(--illus-panel-stroke)"
              strokeWidth="1"
              filter="url(#iso-ambient-shadow)"
            />
            <circle cx="10" cy="9" r="4" fill="var(--primary)" />
            <text
              x="32"
              y="12.5"
              fill="var(--primary)"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              SECURE
            </text>
          </g>
        </svg>
      </div>

      {/* 3. Three Short Feature Value Propositions (White Icon Tiles with Colored Outline Icons) */}
      <div className="w-full space-y-2.5 pt-1">
        {/* Feature 1: Organize APIs in folders (Blue icon) */}
        <div className="flex items-center gap-3 text-xs">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border shadow-2xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <FolderTree className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <span
              className="font-bold mr-1.5"
              style={{ color: 'var(--text-heading)' }}
            >
              Organize APIs in folders
            </span>
            <span className="hidden xl:inline" style={{ color: 'var(--text-body)' }}>
              &mdash; Structure services and nested routes effortlessly
            </span>
          </div>
        </div>

        {/* Feature 2: Automate assertions and test runs (Green icon) */}
        <div className="flex items-center gap-3 text-xs">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border shadow-2xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
          </div>
          <div>
            <span
              className="font-bold mr-1.5"
              style={{ color: 'var(--text-heading)' }}
            >
              Automate assertions and test runs
            </span>
            <span className="hidden xl:inline" style={{ color: 'var(--text-body)' }}>
              &mdash; Validate status codes, payloads, and schema integrity
            </span>
          </div>
        </div>

        {/* Feature 3: Monitor response latency in real time (Orange icon) */}
        <div className="flex items-center gap-3 text-xs">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border shadow-2xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent-orange)' }} />
          </div>
          <div>
            <span
              className="font-bold mr-1.5"
              style={{ color: 'var(--text-heading)' }}
            >
              Monitor response latency in real time
            </span>
            <span className="hidden xl:inline" style={{ color: 'var(--text-body)' }}>
              &mdash; Track p95 timings, network payload sizes, and SLAs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
