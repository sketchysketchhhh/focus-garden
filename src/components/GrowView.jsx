import { useState } from 'react'
import Plant from './Plant.jsx'
import { DURATIONS, SPECIES, STRICT_GRACE_MS, formatClock, formatMinutes } from '../lib.js'

const RING_R = 92
const RING_C = 2 * Math.PI * RING_R

function growthText(p) {
  if (p < 0.1) return 'Seed planted'
  if (p < 0.4) return 'Sprouting'
  if (p < 0.75) return 'Growing strong'
  if (p < 1) return 'Almost blooming'
  return 'Fully grown'
}

function Toggle({ checked, onChange, title, hint }) {
  return (
    <label className="toggle">
      <span className="toggle-text">
        <span className="toggle-title">{title}</span>
        {hint && <span className="toggle-hint">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
    </label>
  )
}

function Running({ active, now, onGiveUp }) {
  const total = active.endAt - active.startAt
  const p = Math.min(1, Math.max(0, (now - active.startAt) / total))
  const species = SPECIES.find((s) => s.id === active.species)

  return (
    <section className="running">
      <div className="ring-wrap">
        <svg className="ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r={RING_R} className="ring-track" />
          <circle
            cx="100"
            cy="100"
            r={RING_R}
            className="ring-fill"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - p)}
          />
        </svg>
        <div className="ring-plant">
          <Plant species={active.species} progress={p} size={150} />
        </div>
      </div>
      <div className="clock" aria-live="off">{formatClock(active.endAt - now)}</div>
      <p className="running-label">{active.label || `Growing a ${species?.name.toLowerCase()}`}</p>
      <p className="muted">
        {growthText(p)} · {Math.round(p * 100)}%
      </p>
      {active.strict && (
        <p className="pill">🔒 Strict mode: leaving for more than {STRICT_GRACE_MS / 1000}s wilts your plant</p>
      )}
      <button className="btn btn-ghost btn-danger" onClick={onGiveUp}>
        Give up
      </button>
    </section>
  )
}

export default function GrowView({ settings, setSettings, active, now, totalMinutes, onStart, onGiveUp }) {
  const [label, setLabel] = useState('')
  const [permission, setPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported',
  )

  if (active) return <Running active={active} now={now} onGiveUp={onGiveUp} />

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }))
  const selected = SPECIES.find((s) => s.id === settings.species) ?? SPECIES[0]

  const askPermission = async () => {
    try {
      setPermission(await Notification.requestPermission())
    } catch {
      setPermission('denied')
    }
  }

  return (
    <section className="setup">
      <div className="card preview">
        <Plant species={selected.id} progress={1} size={170} />
        <p className="preview-text">
          Focus for <strong>{formatMinutes(settings.minutes)}</strong> to grow a{' '}
          <strong>{selected.name.toLowerCase()}</strong>
        </p>
      </div>

      <form
        className="card controls"
        onSubmit={(e) => {
          e.preventDefault()
          onStart(label)
          setLabel('')
        }}
      >
        <label className="field">
          <span className="field-label">What are you focusing on?</span>
          <input
            type="text"
            value={label}
            maxLength={60}
            placeholder="e.g. Read chapter 3"
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>

        <fieldset className="field">
          <legend className="field-label">Plant</legend>
          <div className="chips">
            {SPECIES.map((s) => {
              const locked = totalMinutes < s.unlockAt
              return (
                <button
                  type="button"
                  key={s.id}
                  className={`chip ${settings.species === s.id ? 'is-active' : ''}`}
                  disabled={locked}
                  aria-pressed={settings.species === s.id}
                  title={locked ? `Unlocks after ${formatMinutes(s.unlockAt)} of focus` : s.name}
                  onClick={() => update({ species: s.id })}
                >
                  <span aria-hidden="true">{locked ? '🔒' : s.emoji}</span> {s.name}
                  {locked && <span className="chip-sub">{formatMinutes(s.unlockAt - totalMinutes)} left</span>}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend className="field-label">
            Duration <output className="duration-value">{formatMinutes(settings.minutes)}</output>
          </legend>
          <div className="chips">
            {DURATIONS.map((m) => (
              <button
                type="button"
                key={m}
                className={`chip ${settings.minutes === m ? 'is-active' : ''}`}
                aria-pressed={settings.minutes === m}
                onClick={() => update({ minutes: m })}
              >
                {m} min
              </button>
            ))}
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={settings.minutes}
            aria-label="Duration in minutes"
            onChange={(e) => update({ minutes: Number(e.target.value) })}
          />
        </fieldset>

        <div className="toggles">
          <Toggle
            title="Strict mode"
            hint={`Leaving the app for more than ${STRICT_GRACE_MS / 1000}s wilts your plant`}
            checked={settings.strict}
            onChange={(strict) => update({ strict })}
          />
          <Toggle title="Sound" hint="Play a chime when your plant blooms" checked={settings.sound} onChange={(sound) => update({ sound })} />
          {permission === 'default' && (
            <button type="button" className="btn btn-ghost btn-small" onClick={askPermission}>
              🔔 Notify me when a session ends
            </button>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-big">
          Start growing
        </button>
      </form>
    </section>
  )
}
