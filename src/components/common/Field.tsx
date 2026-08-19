import { type PropsWithChildren } from "react"

interface FieldProps extends PropsWithChildren {
  label: string
  error?: string
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <div className='mb-3'>
      <label className='field-label'>{label}</label>
      {children}
      {error && <div className='field-error'>{error}</div>}
    </div>
  )
}
