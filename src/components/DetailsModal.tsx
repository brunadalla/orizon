import { useEffect, useState } from "react"
import {
  Appointment,
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
} from "../types/appointment.types."
import { Patient } from "../types/patient.types"
import { PAYMENT_METHODS, STATUS_LABELS } from "../utils/constants"
import { DOCTORS } from "../data/mockData"
import { Modal } from "./common/Modal"
import { formatDateBR } from "../utils/helpers"
import { Field } from "./common/Field"

type ToastType = "success" | "error" | "warning"

interface DetailsModalProps {
  appointment: Appointment | null
  patients: Patient[]
  onClose: () => void
  updateAppointment: (
    appointmentId: string,
    updates: Partial<Appointment>
  ) => void
  addToast: (message: string, type: ToastType) => void
}

export function DetailsModal({
  appointment,
  patients,
  onClose,
  updateAppointment,
  addToast,
}: DetailsModalProps) {
  const [value, setValue] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING")
  const [status, setStatus] = useState<AppointmentStatus>("CONFIRMED")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!appointment) {
      return
    }

    setValue(appointment.value)
    setPaymentMethod(appointment.paymentMethod)
    setPaymentStatus(appointment.paymentStatus)
    setStatus(appointment.status)
    setError("")
  }, [appointment])

  if (!appointment) {
    return null
  }

  const patient = patients.find((item) => item.id === appointment.patientId)

  const doctor = DOCTORS.find((item) => item.id === appointment.doctorId)

  const handleSave = () => {
    if (!value || Number(value) <= 0) {
      setError("Informe um valor de cobrança válido.")
      return
    }

    updateAppointment(appointment.id, {
      value: Number(value),
      paymentMethod,
      paymentStatus,
      status,
    })

    addToast("Dados do agendamento atualizados.", "success")

    onClose()
  }

  return (
    <Modal
      open={Boolean(appointment)}
      title='Detalhes do agendamento'
      onClose={onClose}
      footer={
        <>
          <button
            type='button'
            className='btn btn-outline-secondary btn-sm'
            onClick={onClose}
          >
            Fechar
          </button>

          <button
            type='button'
            className='btn btn-petrol btn-sm'
            onClick={handleSave}
          >
            <i className='bi bi-check2 me-1' />
            Salvar alterações
          </button>
        </>
      }
    >
      <div className='section-title'>Paciente</div>

      <div className='row' style={{ fontSize: 13.5 }}>
        <div className='col-sm-6 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            Nome
          </span>

          {patient?.name ?? "Paciente não encontrado"}
        </div>

        <div className='col-sm-6 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            CPF
          </span>

          <span className='font-mono'>{patient?.cpf ?? "—"}</span>
        </div>

        <div className='col-sm-6 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            Nascimento
          </span>

          {patient?.birthDate ? formatDateBR(patient.birthDate) : "—"}
        </div>

        <div className='col-sm-6 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            Telefone
          </span>

          {patient?.phone ?? "—"}
        </div>

        <div className='col-12 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            Endereço
          </span>

          {patient?.address ?? "—"}
        </div>
      </div>

      <div className='section-title'>Agendamento</div>

      <div className='row' style={{ fontSize: 13.5 }}>
        <div className='col-sm-4 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            Médico
          </span>

          {doctor?.name ?? "Médico não encontrado"}
        </div>

        <div className='col-sm-4 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            Data
          </span>

          {formatDateBR(appointment.date)}
        </div>

        <div className='col-sm-4 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            Horário
          </span>

          <span className='font-mono'>
            {appointment.start}–{appointment.end}
          </span>
        </div>

        <div className='col-12 mb-2'>
          <span className='text-muted d-block' style={{ fontSize: 11.5 }}>
            Motivo
          </span>

          {appointment.reason || "—"}
        </div>

        <div className='col-sm-6'>
          <Field label='Status do agendamento'>
            <select
              className='form-select'
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AppointmentStatus)
              }
            >
              {Object.entries(STATUS_LABELS).map(([statusValue, label]) => (
                <option key={statusValue} value={statusValue}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className='section-title'>Cobrança</div>

      <div className='row'>
        <div className='col-sm-4'>
          <Field label='Valor (R$) *' error={error}>
            <input
              type='number'
              min={0}
              step={10}
              className={`form-control font-mono ${error ? "is-invalid" : ""}`}
              value={value}
              onChange={(event) => {
                setValue(Number(event.target.value))
                setError("")
              }}
            />
          </Field>
        </div>

        <div className='col-sm-4'>
          <Field label='Forma de pagamento'>
            <select
              className='form-select'
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value as PaymentMethod)
              }
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className='col-sm-4'>
          <Field label='Status do pagamento'>
            <select
              className='form-select'
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(event.target.value as PaymentStatus)
              }
            >
              <option value='PENDING'>Pendente</option>
              <option value='PAID'>Pago</option>
            </select>
          </Field>
        </div>
      </div>
    </Modal>
  )
}
