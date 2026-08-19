interface Toast {
  id: string
  message: string
  type: "success" | "error" | "warning"
}

interface ToastStackProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const TOAST_ICONS = {
  success: "bi-check-circle-fill",
  error: "bi-x-circle-fill",
  warning: "bi-exclamation-triangle-fill",
} as const

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  const getToastIcon = (type: keyof typeof TOAST_ICONS) => {
    return TOAST_ICONS[type] ?? "bi-info-circle-fill"
  }

  return (
    <div className='toast-stack' aria-live='polite'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item toast-${toast.type}`}
          role='status'
        >
          <i className={`bi ${getToastIcon(toast.type)}`} aria-hidden='true' />

          <span>{toast.message}</span>

          <button
            type='button'
            className='toast-close'
            onClick={() => onDismiss(toast.id)}
            aria-label='Fechar aviso'
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
