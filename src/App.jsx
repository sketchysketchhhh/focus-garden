import { useCallback, useEffect, useRef, useState } from 'react'
import GrowView from './components/GrowView.jsx'
import GardenView from './components/GardenView.jsx'
import StatsView from './components/StatsView.jsx'
import ResultModal from './components/ResultModal.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import {
  MINUTE_MS,
  SPECIES,
  STRICT_GRACE_MS,
  chime,
  computeStats,
  formatClock,
  load,
  notify,
  save,
} from './lib.js'

const TABS = [
  { id: 'grow', label: 'Grow', icon: '🌱' },
  { id: 'garden', label: 'Garden', icon: '🏡' },
  { id: 'stats', label: 'Stats', icon: '📊' },
]

const DEFAULT_SETTINGS = { species: 'daisy', minutes: 25, strict: false, sound: true }

export default function App() {
  const [tab, setTab] = useState('grow')
  const [sessions, setSessions] = useState(() => load('fg.sessions', []))
  const [active, setActive] = useState(() => load('fg.active', null))
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...load('fg.settings', {}) }))
  const [result, setResult] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  const activeRef = useRef(active)
  const finishedRef = useRef(null)
  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => save('fg.sessions', sessions), [sessions])
  useEffect(() => save('fg.active', active), [active])
  useEffect(() => save('fg.settings', settings), [settings])

  const stats = computeStats(sessions, now)

  const finish = useCallback(
    (session, status, at) => {
      if (finishedRef.current === session.startAt) return
      finishedRef.current = session.startAt

      const endedAt = Math.min(at, session.endAt)
      const record = {
        id: `${session.startAt.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        species: session.species,
        label: session.label,
        minutes: status === 'grown' ? session.minutes : Math.floor((endedAt - session.startAt) / MINUTE_MS),
        planned: session.minutes,
        startedAt: session.startAt,
        endedAt,
        status,
      }
      setSessions((list) => [record, ...list])
      setActive(null)
      setResult(record)

      if (status === 'grown') {
        const name = SPECIES.find((s) => s.id === session.species)?.name ?? 'plant'
        if (settings.sound) chime()
        navigator.vibrate?.([200, 100, 200])
        if (document.hidden) notify('Your plant has grown! 🌱', `${name} · ${session.minutes} minutes of focus`)
      }
    },
    [settings.sound],
  )

  // Tick while a session runs. Time is derived from timestamps, so throttled
  // background tabs and reloads never drift.
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [active])

  useEffect(() => {
    if (!active) return
    // In strict mode, an away period is judged when the user returns.
    if (active.strict && active.hiddenAt) return
    if (now >= active.endAt) finish(active, 'grown', now)
  }, [now, active, finish])

  // Strict mode: leaving the app for longer than the grace period wilts the plant.
  useEffect(() => {
    if (!active?.strict) return
    const check = () => {
      const a = activeRef.current
      if (!a) return
      if (document.hidden) {
        if (!a.hiddenAt) setActive({ ...a, hiddenAt: Date.now() })
        return
      }
      if (!a.hiddenAt) return
      const away = Math.min(Date.now(), a.endAt) - a.hiddenAt
      if (away > STRICT_GRACE_MS) finish(a, 'wilted', a.hiddenAt + STRICT_GRACE_MS)
      else setActive({ ...a, hiddenAt: null })
    }
    check()
    document.addEventListener('visibilitychange', check)
    return () => document.removeEventListener('visibilitychange', check)
  }, [active?.strict, active?.startAt, finish])

  // Keep the screen awake during a session (supported on most phones).
  useEffect(() => {
    if (!active?.startAt || !('wakeLock' in navigator)) return
    let lock = null
    let cancelled = false
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release()
      } catch {
        // Denied or unsupported; the timer still works.
      }
    }
    const onVisible = () => !document.hidden && request()
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      lock?.release().catch(() => {})
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [active?.startAt])

  useEffect(() => {
    document.title = active ? `${formatClock(active.endAt - now)} · Focus Garden` : 'Focus Garden'
  }, [active, now])

  const start = (label) => {
    const t = Date.now()
    finishedRef.current = null
    setNow(t)
    setActive({
      species: settings.species,
      minutes: settings.minutes,
      label: label.trim(),
      strict: settings.strict,
      startAt: t,
      endAt: t + settings.minutes * MINUTE_MS,
      hiddenAt: null,
    })
  }

  const giveUp = () =>
    setConfirming({
      title: 'Give up this session?',
      message: 'Your plant will wilt and stay in your garden as a reminder.',
      confirmLabel: 'Give up',
      onConfirm: () => {
        const a = activeRef.current
        if (a) finish(a, 'wilted', Date.now())
      },
    })

  const clearData = () =>
    setConfirming({
      title: 'Reset your garden?',
      message: 'This deletes every plant and all your stats. It cannot be undone.',
      confirmLabel: 'Delete everything',
      onConfirm: () => setSessions([]),
    })

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">🌱</span>
          <span>Focus Garden</span>
        </div>
        <div className="badges">
          <span className="badge" title="Day streak">🔥 {stats.streak}</span>
          <span className="badge" title="Plants grown">🌼 {stats.grownCount}</span>
        </div>
      </header>

      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'is-active' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon" aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
            {t.id === 'grow' && active && tab !== 'grow' && (
              <span className="tab-live">{formatClock(active.endAt - now)}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'grow' && (
          <GrowView
            settings={settings}
            setSettings={setSettings}
            active={active}
            now={now}
            totalMinutes={stats.totalMinutes}
            onStart={start}
            onGiveUp={giveUp}
          />
        )}
        {tab === 'garden' && <GardenView sessions={sessions} onGrow={() => setTab('grow')} />}
        {tab === 'stats' && <StatsView stats={stats} onClear={clearData} />}
      </main>

      {confirming && (
        <ConfirmDialog
          {...confirming}
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            confirming.onConfirm()
            setConfirming(null)
          }}
        />
      )}

      {result && (
        <ResultModal
          session={result}
          onClose={() => setResult(null)}
          onGarden={() => {
            setResult(null)
            setTab('garden')
          }}
        />
      )}
    </div>
  )
}
