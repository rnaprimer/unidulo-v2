// A dieline: the flat drawing a factory cuts and folds into a box.
// Solid lines are cuts, dashed lines are folds.
const PANELS = [
  { x: 40, w: 180, label: "Length" },
  { x: 220, w: 120, label: "Width" },
  { x: 340, w: 180, label: "" },
  { x: 520, w: 120, label: "" },
];
const TOP = 90;
const HEIGHT = 130;
const FLAP = 60;

export function Dieline() {
  const bottom = TOP + HEIGHT;
  // One continuous outline: glue tab, top flaps, right edge, bottom flaps.
  const outline = [
    `M40 ${TOP}`,
    `L18 ${TOP + 12} L18 ${bottom - 12} L40 ${bottom}`,
    ...[...PANELS].map((p) => `L${p.x + 4} ${bottom + FLAP} L${p.x + p.w - 4} ${bottom + FLAP} L${p.x + p.w} ${bottom}`),
    `L640 ${TOP}`,
    ...[...PANELS].reverse().map((p) => `L${p.x + p.w - 4} ${TOP - FLAP} L${p.x + 4} ${TOP - FLAP} L${p.x} ${TOP}`),
    "Z",
  ].join(" ");

  return (
    <svg
      viewBox="0 0 700 330"
      role="img"
      aria-label="Flat cutting drawing of a shipping box, with its length, width and height marked"
      className="h-auto w-full"
    >
      <path d={outline} fill="var(--color-lime-soft)" stroke="none" />
      <g stroke="var(--color-action)" strokeWidth="1.5" strokeDasharray="7 5" fill="none">
        <line x1="40" y1={TOP} x2="640" y2={TOP} />
        <line x1="40" y1={bottom} x2="640" y2={bottom} />
        {[40, 220, 340, 520].map((x) => (
          <line key={x} x1={x} y1={TOP} x2={x} y2={bottom} />
        ))}
      </g>
      <path
        d={outline}
        pathLength={1}
        className="draw"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g fill="var(--color-ink)" fontSize="15" fontWeight="500" textAnchor="middle">
        {PANELS.filter((p) => p.label).map((p) => (
          <text key={p.label} x={p.x + p.w / 2} y={TOP + HEIGHT / 2 + 5}>
            {p.label}
          </text>
        ))}
      </g>
      {/* Height marker on the right */}
      <g stroke="var(--color-muted)" strokeWidth="1" fill="none">
        <line x1="662" y1={TOP} x2="662" y2={bottom} />
        <line x1="656" y1={TOP} x2="668" y2={TOP} />
        <line x1="656" y1={bottom} x2="668" y2={bottom} />
      </g>
      <text
        x="682"
        y={TOP + HEIGHT / 2}
        fontSize="15"
        fontWeight="500"
        fill="var(--color-ink)"
        textAnchor="middle"
        transform={`rotate(90 682 ${TOP + HEIGHT / 2})`}
      >
        Height
      </text>
      <g fontSize="13" fill="var(--color-muted)">
        <line x1="40" y1="312" x2="70" y2="312" stroke="var(--color-ink)" strokeWidth="2" />
        <text x="78" y="316">Cut</text>
        <line x1="130" y1="312" x2="160" y2="312" stroke="var(--color-action)" strokeWidth="1.5" strokeDasharray="7 5" />
        <text x="168" y="316">Fold</text>
      </g>
    </svg>
  );
}
