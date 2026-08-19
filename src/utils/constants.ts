import { AppointmentStatus, PaymentMethod, PaymentStatus } from "../types/appointment.types."

export const PAYMENT_METHODS: PaymentMethod[] = [
  "PIX",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "CASH",
  "INSURANCE",
]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  CASH: "Dinheiro",
  INSURANCE: "Convênio",
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  CONFIRMED: "Confirmado",
  WAITING: "Aguardando",
  IN_PROGRESS: "Em atendimento",
  COMPLETED: "Atendido",
  CANCELLED: "Cancelado",
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
}