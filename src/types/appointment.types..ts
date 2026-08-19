export type PaymentStatus = "PAID" | "PENDING"

export type PaymentMethod =
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CASH"
  | "INSURANCE"

export type AppointmentStatus =
  | "CANCELLED"
  | "COMPLETED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "WAITING"

export interface Appointment {
  date: string
  doctorId: string
  end: string
  id: string
  patientId: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  reason: string
  start: string
  status: AppointmentStatus
  value: number
}
