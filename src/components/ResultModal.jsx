import { useEffect, useRef } from 'react'
import Plant from './Plant.jsx'
import { SPECIES, formatMinutes } from '../lib.js'

export default function ResultModal({ session, onClose, onGarden }) {
  const ref = useRef(null)
  const grown = session.status === 'grown'
  const name = SPECIES.find((s) => s.id === session.species)?.name ?? 'plant'

  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal?.()
    return () => dialog?.close?.()
  }, [])

  return (
    <dialog ref={ref} className="modal" onClose={onClose} onCancel={onClose}>
      <div className={`modal-plant ${grown ? 'pop' : ''}`}>
        <Plant species={session.species} progress={1} wilted={!grown} size={140} />
      </div>
      <h2>{grown ? `Your ${name.toLowerCase()} bloomed!` : 'Your plant wilted'}</h2>
      <p className="muted">
        {grown
          ? `${formatMinutes(session.minutes)} of focus added to your garden.`
          : `You focused for ${formatMinutes(session.minutes)} of ${formatMinutes(session.planned)}. Try again.`}
      </p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>
          {grown ? 'Grow another' : 'Try again'}
        </button>
        <button className="btn btn-primary" onClick={onGarden}>
          See garden
        </button>
      </div>
    </dialog>
  )
}
