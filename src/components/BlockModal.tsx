import { useEffect, useState, type ChangeEvent } from "react"

import { Block, DOCTORS, TIME_SLOTS } from "../data/mockData"

import { uid, todayISO, toMinutes } from "../utils/helpers"

import { Field } from "./common/Field"
import { Modal } from "./common/Modal"
import { Appointment } from "../types/appointment.types."

type ToastType = "success" | "error" | "warning"

interface BlockModalProps {
  addToast: (message: string, type: ToastType) => void

  appointments: Appointment[]
  blocks: Block[]

  onClose: () => void
  onSave: (block: Block) => void

  open: boolean

  defaultDate?: string
  defaultDoctorId?: string
}

export function BlockModal({
  open,
  onClose,
  appointments,
  onSave,
  addToast,
  defaultDoctorId,
  defaultDate,
}: BlockModalProps) {
  const [doctorId, setDoctorId] = useState(
    defaultDoctorId ?? DOCTORS[0]?.id ?? ""
  )

  const [date, setDate] = useState(defaultDate ?? todayISO())

  const [start, setStart] = useState("12:00")

  const [end, setEnd] = useState("13:00")

  const [reason, setReason] = useState("")

  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) {
      return
    }

    setDoctorId(defaultDoctorId ?? DOCTORS[0]?.id ?? "")

    setDate(defaultDate ?? todayISO())

    setStart("12:00")
    setEnd("13:00")
    setReason("")
    setError("")
  }, [open, defaultDoctorId, defaultDate])

  const handleSubmit = () => {
    setError("")

    const startMinutes = toMinutes(start)

    const endMinutes = toMinutes(end)

    if (endMinutes <= startMinutes) {
      setError("O horário final deve ser após o horário inicial.")
      return
    }

    const conflictingAppointments = appointments.filter((appointment) => {
      if (appointment.doctorId !== doctorId) {
        return false
      }

      if (appointment.date !== date) {
        return false
      }

      if (appointment.status === "CANCELLED") {
        return false
      }

      const appointmentStart = toMinutes(appointment.start)

      const appointmentEnd = toMinutes(appointment.end)

      return startMinutes < appointmentEnd && endMinutes > appointmentStart
    })

    if (conflictingAppointments.length > 0) {
      const appointmentCount = conflictingAppointments.length

      setError(
        `Existem ${appointmentCount} ${
          appointmentCount === 1 ? "agendamento" : "agendamentos"
        } nesse período. Cancele ou transfira ${
          appointmentCount === 1 ? "o agendamento" : "os agendamentos"
        } antes de bloquear.`
      )

      return
    }

    const block: Block = {
      id: uid("blk"),
      doctorId,
      date,
      start,
      end,
      reason: reason.trim() || "Indisponível",
    }

    onSave(block)

    addToast("Período bloqueado na agenda.", "success")

    onClose()
  }

  const handleDoctorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDoctorId(event.target.value)
  }

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value)
  }

  const handleStartChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStart(event.target.value)
  }

  const handleEndChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setEnd(event.target.value)
  }

  const handleReasonChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReason(event.target.value)
  }

  return (
    <Modal
      open={open}
      title='Bloquear período (ausência do médico)'
      onClose={onClose}
      footer={
        <>
          <button
            type='button'
            className='btn btn-outline-secondary btn-sm'
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type='button'
            className='btn btn-petrol btn-sm'
            onClick={handleSubmit}
          >
            <i className='bi bi-lock-fill me-1' />
            Bloquear
          </button>
        </>
      }
    >
      <div className='row'>
        <div className='col-sm-6'>
          <Field label='Médico(a) *'>
            <select
              className='form-select'
              value={doctorId}
              onChange={handleDoctorChange}
            >
              {DOCTORS.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className='col-sm-6'>
          <Field label='Data *'>
            <input
              type='date'
              className='form-control'
              value={date}
              onChange={handleDateChange}
              min={todayISO()}
            />
          </Field>
        </div>

        <div className='col-sm-6'>
          <Field label='Das *'>
            <select
              className='form-select'
              value={start}
              onChange={handleStartChange}
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className='col-sm-6'>
          <Field label='Até *'>
            <select
              className='form-select'
              value={end}
              onChange={handleEndChange}
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className='col-12'>
          <Field label='Motivo'>
            <input
              type='text'
              className='form-control'
              value={reason}
              onChange={handleReasonChange}
              placeholder='Ex.: congresso, atestado, compromisso pessoal'
            />
          </Field>
        </div>
      </div>

      {error && (
        <div
          className='p-2'
          role='alert'
          style={{
            background: "var(--coral-bg)",
            color: "#a12f2f",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <i className='bi bi-exclamation-triangle-fill me-1' />
          {error}
        </div>
      )}
    </Modal>
  )
}
