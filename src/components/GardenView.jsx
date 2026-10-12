import { useState } from 'react'
import Plant from './Plant.jsx'
import { SPECIES, dayKey, formatMinutes } from '../lib.js'

const FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'all', label: 'All time' },
]

function inRange(session, filter, now) {
  if (filter === 'all') return true
  if (filter === 'today') return dayKey(session.endedAt) === dayKey(now)
  return now - session.endedAt < 7 * 24 * 60 * 60 * 1000
}

export default function GardenView({ sessions, onGrow }) {
  const [filter, setFilter] = useState('week')
  const [now] = useState(() => Date.now())
  const shown = sessions.filter((s) => inRange(s, filter, now))
  const grown = shown.filter((s) => s.status === 'grown')
  const wilted = shown.length - grown.length
  const minutes = grown.reduce((sum, s) => sum + s.minutes, 0)

  return (
    <section className="garden">
      <div className="garden-head">
        <div>
          <h1>Your garden</h1>
          <p className="muted">
            {grown.length} grown · {wilted} wilted · {formatMinutes(minutes)} focused
          </p>
        </div>
        <div className="segmented" role="tablist" aria-label="Time range">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              className={filter === f.id ? 'is-active' : ''}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card empty">
          <Plant species="daisy" progress={0.05} size={110} label="An empty pot" />
          <p>Nothing has grown here yet. Finish a focus session to plant something.</p>
          <button className="btn btn-primary" onClick={onGrow}>
            Plant a seed
          </button>
        </div>
      ) : (
        <ul className="plot">
          {shown.map((s) => {
            const name = SPECIES.find((x) => x.id === s.species)?.name ?? s.species
            const when = new Date(s.endedAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
            return (
              <li key={s.id} className={`plot-cell ${s.status === 'wilted' ? 'is-wilted' : ''}`}>
                <Plant
                  species={s.species}
                  progress={1}
                  wilted={s.status === 'wilted'}
                  size={72}
                  label={`${s.status === 'wilted' ? 'Wilted' : 'Grown'} ${name}`}
                />
                <span className="plot-min">{formatMinutes(s.minutes)}</span>
                <span className="plot-meta" title={s.label || name}>
                  {s.label || name}
                </span>
                <span className="plot-when">{when}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
