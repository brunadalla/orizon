import { AppointmentStatus } from "../../../types/appointment.types."
import { STATUS_LABELS } from "../../../utils/constants"

interface StatusBadgeProps {
  status: AppointmentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
