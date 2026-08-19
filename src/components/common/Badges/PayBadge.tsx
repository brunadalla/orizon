import { PaymentStatus } from "../../../types/appointment.types."
import { PAYMENT_STATUS_LABELS } from "../../../utils/constants"

interface PayBadgeProps {
  status: PaymentStatus
}

export function PayBadge({ status }: PayBadgeProps) {
  return (
    <span className={`pay-badge pay-${status.toLowerCase()}`}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  )
}
