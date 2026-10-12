import { useEffect, useRef } from 'react'

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal?.()
    return () => dialog?.close?.()
  }, [])

  return (
    <dialog ref={ref} className="modal" onCancel={onCancel}>
      <h2>{title}</h2>
      <p className="muted">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel} autoFocus>
          Keep going
        </button>
        <button className="btn btn-primary btn-destructive" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
