// Schematic tank glyph — the ridge/seam pattern communicates construction type.
export default function TankIcon({ v }) {
  const clipId = `tank-clip-${v}`

  let pattern = null
  let strokeProps = { stroke: 'currentColor', strokeWidth: v === 'gfs' ? 0.75 : 1 }

  if (v === 'za') {
    pattern = [6, 12, 18, 24, 30, 36, 42].map((x) => (
      <path key={x} d={`M${x} 10 v28`} strokeDasharray="2 2" />
    ))
  } else if (v === 'gi') {
    pattern = (
      <>
        <path d="M6 22H42" />
        <path d="M6 30H42" />
      </>
    )
  } else if (v === 'fbe') {
    strokeProps = { fill: 'currentColor' }
    pattern = [10, 18, 26, 34].flatMap((x) =>
      [14, 22, 30].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" />)
    )
  } else if (v === 'gfs') {
    pattern = <path d="M6 10L42 38M6 38L42 10M6 24L42 24" />
  }

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <defs>
        <clipPath id={clipId}>
          <path d="M8 10L24 4L40 10V38L24 44L8 38Z" />
        </clipPath>
      </defs>
      <path d="M8 10L24 4L40 10V38L24 44L8 38Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`} {...strokeProps}>
        {pattern}
      </g>
    </svg>
  )
}
