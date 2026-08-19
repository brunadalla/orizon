import { Block } from "../data/mockData"
import { Appointment } from "../types/appointment.types."

interface FindConflictParams {
  appointments: Appointment[]
  blocks: Block[]
  doctorId: string
  date: string
  start: string
  end: string
  ignoreId?: string | null
}

type ConflictType = "appointment" | "block"

interface Conflict {
  type: ConflictType
  item: Appointment | Block
}

export const uid = (prefix = "id"): string => {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

const intervalsOverlap = (
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean => {
  return startA < endB && endA > startB
}

export const findConflict = ({
  appointments,
  blocks,
  doctorId,
  date,
  start,
  end,
  ignoreId = null,
}: FindConflictParams): Conflict | null => {
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)

  const appointmentConflict = appointments.find((appointment) => {
    if (appointment.id === ignoreId) {
      return false
    }

    if (appointment.doctorId !== doctorId || appointment.date !== date) {
      return false
    }

    if (appointment.status === "CANCELLED") {
      return false
    }

    return intervalsOverlap(
      startMinutes,
      endMinutes,
      toMinutes(appointment.start),
      toMinutes(appointment.end)
    )
  })

  if (appointmentConflict) {
    return {
      type: "appointment",
      item: appointmentConflict,
    }
  }

  const blockConflict = blocks.find((block) => {
    if (block.doctorId !== doctorId || block.date !== date) {
      return false
    }

    return intervalsOverlap(
      startMinutes,
      endMinutes,
      toMinutes(block.start),
      toMinutes(block.end)
    )
  })

  if (blockConflict) {
    return {
      type: "block",
      item: blockConflict,
    }
  }

  return null
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export const formatCurrency = (value: number): string => {
  return currencyFormatter.format(Number(value) || 0)
}

export const formatDateBR = (isoDate: string): string => {
  if (!isoDate) {
    return ""
  }

  const [year, month, day] = isoDate.split("-")

  return `${day}/${month}/${year}`
}

export const weekdayLong = (isoDate: string): string => {
  if (!isoDate) {
    return ""
  }

  const date = new Date(`${isoDate}T00:00:00`)

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
}

export const maskCPF = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

export const isValidCPFFormat = (value: string): boolean => {
  return value.replace(/\D/g, "").length === 11
}

export const maskPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2")
}

export const todayISO = () => new Date().toISOString().slice(0, 10)

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)

  return hours * 60 + minutes
}

export function addMinutes(time: string, minutes: number): string {
  const totalMinutes = toMinutes(time) + minutes

  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0")

  const remainingMinutes = (totalMinutes % 60).toString().padStart(2, "0")

  return `${hours}:${remainingMinutes}`
}
