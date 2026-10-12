export const SPECIES = [
  { id: 'daisy', name: 'Daisy', emoji: '🌼', unlockAt: 0 },
  { id: 'tulip', name: 'Tulip', emoji: '🌷', unlockAt: 0 },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', unlockAt: 60 },
  { id: 'cactus', name: 'Cactus', emoji: '🌵', unlockAt: 180 },
  { id: 'tree', name: 'Fruit tree', emoji: '🌳', unlockAt: 300 },
]

export const DURATIONS = [10, 25, 45, 60]

// `?speed=60` makes a minute last one second — handy for demos and testing.
const speed = Number(new URLSearchParams(window.location.search).get('speed')) || 1
export const MINUTE_MS = 60_000 / speed

// How long the app can be in the background before a strict-mode plant wilts.
export const STRICT_GRACE_MS = 10_000

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode, quota); the app still works in-memory.
  }
}

export function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatMinutes(min) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function computeStats(sessions, now = Date.now()) {
  const grown = sessions.filter((s) => s.status === 'grown')
  const totalMinutes = grown.reduce((sum, s) => sum + s.minutes, 0)

  const days = new Set(grown.map((s) => dayKey(s.endedAt)))
  const cursor = new Date(now)
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const week = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = dayKey(d)
    week.push({
      key,
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      minutes: grown.filter((s) => dayKey(s.endedAt) === key).reduce((sum, s) => sum + s.minutes, 0),
    })
  }

  const finished = sessions.length
  return {
    totalMinutes,
    grownCount: grown.length,
    wiltedCount: finished - grown.length,
    successRate: finished ? Math.round((grown.length / finished) * 100) : 0,
    streak,
    week,
  }
}

export function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = ctx.currentTime + i * 0.18
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.65)
    })
  } catch {
    // Audio is a nice-to-have.
  }
}

export async function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) return reg.showNotification(title, { body, icon: '/pwa-192x192.png', tag: 'focus-garden' })
    new Notification(title, { body, icon: '/pwa-192x192.png' })
  } catch {
    // Some browsers throw on page-level notifications; ignore.
  }
}
