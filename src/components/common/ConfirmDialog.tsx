import { type PropsWithChildren } from "react"

interface ConfirmDialogProps extends PropsWithChildren {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  label?: string
  variant?: "petrol" | "coral"
}

export function ConfirmDialog({
  open,
  title,
  message,
  label = "Confirmar",
  variant = "petrol",
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  if (!open) {
    return null
  }

  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel()
    }
  }

  const confirmButtonClass =
    variant === "coral" ? "btn btn-danger btn-sm" : "btn btn-petrol btn-sm"

  return (
    <div className='modal-overlay' onMouseDown={handleOverlayMouseDown}>
      <div
        aria-modal='true'
        className='modal-panel'
        role='dialog'
        style={{ maxWidth: 420 }}
      >
        <div className='modal-panel-head'>
          <h5>{title}</h5>

          <button
            type='button'
            aria-label='Fechar'
            className='modal-close-btn'
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <div className='modal-panel-body'>
          <p className='mb-0' style={{ color: "var(--ink-soft)" }}>
            {message}
          </p>

          {children}
        </div>

        <div className='modal-panel-foot'>
          <button
            type='button'
            className='btn btn-outline-secondary btn-sm'
            onClick={onCancel}
          >
            Voltar
          </button>

          <button
            type='button'
            className={confirmButtonClass}
            onClick={onConfirm}
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  )
}
