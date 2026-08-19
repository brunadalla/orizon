import { type PropsWithChildren, type ReactNode, useEffect } from "react"

interface ModalProps extends PropsWithChildren {
  open: boolean
  title: string
  onClose: () => void
  footer?: ReactNode
  large?: boolean
}

export function Modal({
  open,
  title,
  onClose,
  footer,
  children,
  large,
}: ModalProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className='modal-overlay'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        aria-label={title}
        aria-modal='true'
        className={`modal-panel ${large ? "modal-panel-lg" : ""}`}
        role='dialog'
      >
        <div className='modal-panel-head'>
          <h5>{title}</h5>
          <button
            aria-label='Fechar'
            className='modal-close-btn'
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className='modal-panel-body'>{children}</div>
        {footer && <div className='modal-panel-foot'>{footer}</div>}
      </div>
    </div>
  )
}
