// Procedurally drawn plants. `progress` (0–1) drives every growth stage,
// so the same component renders a seedling, a growing plant or a full bloom.

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const ease = (t) => 1 - Math.pow(1 - t, 3)
const stage = (p, start, length) => ease(clamp((p - start) / length))

const LIVE = {
  stem: '#3f8f3a',
  leaf: '#5cb85c',
  leafDark: '#3f8f3a',
  trunk: '#8b5a2b',
  cactus: '#4f9d58',
  cactusDark: '#3c7d45',
}
const WILT = {
  stem: '#8a7a55',
  leaf: '#a8935f',
  leafDark: '#8a7a55',
  trunk: '#6e5a45',
  cactus: '#9a9564',
  cactusDark: '#7d7850',
}
const BLOOM = {
  daisy: { petal: '#ffffff', center: '#f4c430', outline: '#d9d4c3' },
  sunflower: { petal: '#ffc61a', center: '#6b3e1f' },
  tulip: { petal: '#e8505b' },
  cactus: { petal: '#ff7eb6', center: '#ffe066' },
  tree: { fruit: '#e8505b' },
}
const BLOOM_WILT = { petal: '#c2ad8f', center: '#7a6248', fruit: '#8a6a50' }

const BASE_Y = 106

function Leaf({ y, scale, side, color }) {
  if (scale <= 0) return null
  return (
    <g transform={`translate(60 ${y}) scale(${side * scale} ${scale}) rotate(-28)`}>
      <ellipse cx="11" cy="0" rx="11" ry="4.8" fill={color} />
    </g>
  )
}

function Petals({ count, rx, ry, offset, color, stroke }) {
  return Array.from({ length: count }, (_, i) => (
    <ellipse
      key={i}
      cx="0"
      cy={-offset}
      rx={rx}
      ry={ry}
      fill={color}
      stroke={stroke}
      strokeWidth={stroke ? 0.8 : undefined}
      transform={`rotate(${(360 / count) * i})`}
    />
  ))
}

function StemPlant({ species, p, c, bloomColors }) {
  const grow = stage(p, 0, 0.75)
  const h = 8 + grow * (species === 'sunflower' ? 70 : 60)
  const top = BASE_Y - h
  const bloom = stage(p, 0.75, 0.25)

  return (
    <>
      <path
        d={`M60 ${BASE_Y} Q64 ${BASE_Y - h / 2} 60 ${top}`}
        stroke={c.stem}
        strokeWidth={species === 'sunflower' ? 3.5 : 2.8}
        fill="none"
        strokeLinecap="round"
      />
      <Leaf y={BASE_Y - h * 0.35} scale={stage(p, 0.12, 0.25)} side={-1} color={c.leaf} />
      <Leaf y={BASE_Y - h * 0.6} scale={stage(p, 0.35, 0.25)} side={1} color={c.leafDark} />
      {bloom <= 0 && <circle cx="60" cy={top} r={2 + grow * 2.5} fill={c.leaf} />}
      {bloom > 0 && (
        <g transform={`translate(60 ${top}) scale(${bloom})`}>
          {species === 'daisy' && (
            <>
              <Petals count={10} rx={3.4} ry={8.5} offset={9} color={bloomColors.petal} stroke={bloomColors.outline} />
              <circle r="5.5" fill={bloomColors.center} />
            </>
          )}
          {species === 'sunflower' && (
            <>
              <Petals count={14} rx={3.2} ry={9.5} offset={12} color={bloomColors.petal} />
              <circle r="8.5" fill={bloomColors.center} />
            </>
          )}
          {species === 'tulip' && (
            <path
              d="M-10 -2 Q-13 -18 -7 -21 L-3 -12 L0 -22 L3 -12 L7 -21 Q13 -18 10 -2 Q0 6 -10 -2 Z"
              fill={bloomColors.petal}
            />
          )}
        </g>
      )}
    </>
  )
}

function Cactus({ p, c, bloomColors }) {
  const grow = stage(p, 0, 0.75)
  const h = 10 + grow * 52
  const top = BASE_Y - h
  const armL = stage(p, 0.3, 0.3)
  const armR = stage(p, 0.5, 0.3)
  const bloom = stage(p, 0.8, 0.2)
  const arm = (x, y, s, dir, key) =>
    s > 0 && (
      <g key={key} transform={`translate(${x} ${y}) scale(${dir * s} ${s})`} fill={c.cactusDark}>
        <rect x="-11" y="-4" width="13" height="8" rx="4" />
        <rect x="-13" y="-20" width="8" height="22" rx="4" />
      </g>
    )

  return (
    <>
      {arm(50, BASE_Y - h * 0.45, armL, 1, 'l')}
      {arm(70, BASE_Y - h * 0.65, armR, -1, 'r')}
      <rect x="49" y={top} width="22" height={h + 4} rx="11" fill={c.cactus} />
      {grow > 0.4 &&
        [0.3, 0.55, 0.8].map((f) => (
          <g key={f} stroke={c.cactusDark} strokeWidth="1" strokeLinecap="round">
            <line x1="55" y1={BASE_Y - h * f} x2="53" y2={BASE_Y - h * f - 2} />
            <line x1="65" y1={BASE_Y - h * f + 6} x2="67" y2={BASE_Y - h * f + 4} />
          </g>
        ))}
      {bloom > 0 && (
        <g transform={`translate(60 ${top + 2}) scale(${bloom})`}>
          <Petals count={6} rx={3} ry={6} offset={5} color={bloomColors.petal} />
          <circle r="3" fill={bloomColors.center} />
        </g>
      )}
    </>
  )
}

function Tree({ p, c, bloomColors }) {
  const grow = stage(p, 0, 0.7)
  const h = 8 + grow * 48
  const top = BASE_Y - h
  const w = 3 + grow * 6
  const crown = stage(p, 0.2, 0.4)
  const sides = stage(p, 0.45, 0.35)
  const fruit = stage(p, 0.82, 0.18)

  return (
    <>
      <path
        d={`M${60 - w / 2} ${BASE_Y} L${60 - w / 4} ${top} L${60 + w / 4} ${top} L${60 + w / 2} ${BASE_Y} Z`}
        fill={c.trunk}
      />
      {sides > 0 && (
        <>
          <circle cx="43" cy={top + 10} r={15 * sides} fill={c.leafDark} />
          <circle cx="77" cy={top + 10} r={15 * sides} fill={c.leafDark} />
        </>
      )}
      {crown > 0 && <circle cx="60" cy={top - 4} r={22 * crown} fill={c.leaf} />}
      {crown <= 0 && <circle cx="60" cy={top} r={2 + grow * 3} fill={c.leaf} />}
      {fruit > 0 &&
        [
          [52, top - 10],
          [68, top - 2],
          [44, top + 12],
          [76, top + 14],
          [60, top - 18],
        ].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={2.8 * fruit} fill={bloomColors.fruit} />)}
    </>
  )
}

export default function Plant({ species = 'daisy', progress = 1, wilted = false, size = 160, label }) {
  const p = clamp(progress)
  const c = wilted ? WILT : LIVE
  const bloomColors = wilted ? BLOOM_WILT : BLOOM[species]

  let body
  if (species === 'cactus') body = <Cactus p={p} c={c} bloomColors={bloomColors} />
  else if (species === 'tree') body = <Tree p={p} c={c} bloomColors={bloomColors} />
  else body = <StemPlant species={species} p={p} c={c} bloomColors={bloomColors} />

  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      role="img"
      aria-label={label ?? `${wilted ? 'Wilted' : 'Growing'} ${species}`}
      className="plant"
    >
      <ellipse cx="60" cy="137" rx="30" ry="3" fill="currentColor" opacity="0.08" />
      <g transform={wilted ? `rotate(-16 60 ${BASE_Y})` : undefined}>{body}</g>
      <path d="M39 110 H81 L76 136 H44 Z" fill="#c8693f" />
      <rect x="35" y="103" width="50" height="9" rx="2.5" fill="#b35a33" />
    </svg>
  )
}
