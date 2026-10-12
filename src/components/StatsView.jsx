import { useState } from 'react'
import Plant from './Plant.jsx'
import { SPECIES, formatMinutes } from '../lib.js'

function WeekChart({ week }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(30, ...week.map((d) => d.minutes))
  const todayKey = week[week.length - 1].key

  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <div className="chart-plot">
        {week.map((d, i) => {
          const showValue = hover === i || (hover === null && d.key === todayKey && d.minutes > 0)
          return (
            <button
              key={d.key}
              type="button"
              className="chart-col"
              aria-label={`${d.label}: ${formatMinutes(d.minutes)}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => setHover(hover === i ? null : i)}
            >
              <span className={`chart-value ${showValue ? 'is-visible' : ''}`}>{formatMinutes(d.minutes)}</span>
              <span
                className={`chart-bar ${hover === i ? 'is-hover' : ''}`}
                style={{ height: `${(d.minutes / max) * 100}%` }}
              />
            </button>
          )
        })}
      </div>
      <div className="chart-axis" aria-hidden="true">
        {week.map((d) => (
          <span key={d.key} className={d.key === todayKey ? 'is-today' : ''}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function StatsView({ stats, onClear }) {
  const tiles = [
    { label: 'Total focus', value: formatMinutes(stats.totalMinutes) },
    { label: 'Plants grown', value: stats.grownCount },
    { label: 'Day streak', value: `${stats.streak} 🔥` },
    { label: 'Success rate', value: `${stats.successRate}%` },
  ]

  return (
    <section className="stats">
      <h1>Your progress</h1>
      <div className="tiles">
        {tiles.map((t) => (
          <div key={t.label} className="card tile">
            <span className="tile-value">{t.value}</span>
            <span className="tile-label">{t.label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Focus minutes, last 7 days</h2>
        <WeekChart week={stats.week} />
      </div>

      <div className="card">
        <h2>Seed collection</h2>
        <ul className="collection">
          {SPECIES.map((s) => {
            const unlocked = stats.totalMinutes >= s.unlockAt
            const pct = Math.min(100, (stats.totalMinutes / Math.max(1, s.unlockAt)) * 100)
            return (
              <li key={s.id} className={unlocked ? '' : 'is-locked'}>
                <Plant species={s.id} progress={unlocked ? 1 : 0.05} size={48} label={s.name} />
                <div className="collection-info">
                  <strong>{s.name}</strong>
                  {unlocked ? (
                    <span className="muted">Unlocked</span>
                  ) : (
                    <>
                      <span className="muted">
                        🔒 {formatMinutes(s.unlockAt - stats.totalMinutes)} more focus to unlock
                      </span>
                      <span className="meter" aria-hidden="true">
                        <span style={{ width: `${pct}%` }} />
                      </span>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <button className="btn btn-ghost btn-danger btn-small" onClick={onClear}>
        Reset garden
      </button>
    </section>
  )
}
