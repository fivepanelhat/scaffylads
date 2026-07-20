/**
 * Decorative scaffold structure for the dashboard hero.
 *
 * Drawn as real scaffold geometry - standards (verticals), ledgers
 * (horizontals), diagonal braces, base plates and boards - rather than
 * abstract shapes, so it reads as the trade to someone who works in it.
 *
 * Purely decorative: hidden from assistive tech, and it never carries text.
 */
export function HeroScaffold({ className }: { className?: string }) {
  // Four bays of standards, spaced evenly across the viewBox.
  const standards = [40, 128, 216, 304];
  // Lift heights - ledgers run between standards at each lift.
  const lifts = [56, 132, 208, 284];

  return (
    <svg
      className={className}
      viewBox="0 0 360 340"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="tube" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8da2c0" />
          <stop offset="100%" stopColor="#4a5a76" />
        </linearGradient>
        <linearGradient id="board" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f5a623" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#c97f16" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Diagonal braces - drawn first so tubes sit over them. */}
      <g stroke="#5b6d8e" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M40 284 L128 208" />
        <path d="M128 284 L216 208" />
        <path d="M216 284 L304 208" />
        <path d="M40 132 L128 56" />
        <path d="M216 132 L304 56" />
      </g>

      {/* Ledgers - horizontal tubes at each lift. */}
      <g stroke="url(#tube)" strokeWidth="5" strokeLinecap="round">
        {lifts.map((y) => (
          <path key={y} d={`M40 ${y} L304 ${y}`} />
        ))}
      </g>

      {/* Boarded-out working platform at the second lift. */}
      <g>
        <rect x="36" y="120" width="272" height="9" rx="2" fill="url(#board)" />
        <rect
          x="36"
          y="120"
          width="272"
          height="9"
          rx="2"
          fill="none"
          stroke="#f5a623"
          strokeOpacity="0.5"
        />
        {/* Board seams. */}
        <g stroke="#0b1220" strokeOpacity="0.35" strokeWidth="1.5">
          <path d="M104 120 L104 129" />
          <path d="M172 120 L172 129" />
          <path d="M240 120 L240 129" />
        </g>
      </g>

      {/* Guardrail above the platform - the thing that keeps people alive. */}
      <g stroke="#3dd6c6" strokeWidth="3" strokeLinecap="round" opacity="0.75">
        <path d="M40 92 L304 92" />
        <path d="M40 106 L304 106" />
      </g>

      {/* Standards - vertical tubes, drawn over ledgers. */}
      <g stroke="url(#tube)" strokeWidth="7" strokeLinecap="round">
        {standards.map((x) => (
          <path key={x} d={`M${x} 40 L${x} 300`} />
        ))}
      </g>

      {/* Couplers at each tube intersection. */}
      <g fill="#9fb3d1" opacity="0.9">
        {standards.flatMap((x) =>
          lifts.map((y) => (
            <rect
              key={`${x}-${y}`}
              x={x - 5}
              y={y - 4}
              width="10"
              height="8"
              rx="2"
            />
          )),
        )}
      </g>

      {/* Base plates on the ground line. */}
      <g fill="#5b6d8e">
        {standards.map((x) => (
          <rect key={x} x={x - 11} y="300" width="22" height="6" rx="1.5" />
        ))}
      </g>
      <path
        d="M20 306 L324 306"
        stroke="#5b6d8e"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export default HeroScaffold;
