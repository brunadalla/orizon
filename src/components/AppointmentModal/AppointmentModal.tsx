import { useEffect, useMemo, useState } from "react"

import type { NewPatient, Patient } from "../../types/patient.types"

import {
  findConflict,
  isValidCPFFormat,
  uid,
  addMinutes,
  todayISO,
  toMinutes,
} from "../../utils/helpers"

import { Block, DOCTORS, TIME_SLOTS } from "../../data/mockData"
import {
  Appointment,
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../types/appointment.types."
import { Modal } from "../common/Modal"
import { Field } from "../common/Field"
import { PatientFields } from "./PatientFields"
import { ConfirmDialog } from "../common/ConfirmDialog"
import { PAYMENT_METHODS } from "../../utils/constants"

type PatientMode = "existing" | "new"

type ToastType = "success" | "error" | "warning"

interface AppointmentFormErrors {
  address?: string
  birthDate?: string
  cpf?: string
  date?: string
  doctorId?: string
  name?: string
  patient?: string
  phone?: string
  slot?: string
  value?: string
}

interface AppointmentInitialData {
  date?: string
  doctorId?: string
  start?: string
}

interface AppointmentModalProps {
  addToast: (message: string, type: ToastType) => void
  appointments: Appointment[]
  blocks: Block[]
  onCancelAppt: (appointmentId: string, reason: string) => void
  onClose: () => void
  onSave: (appointment: Appointment, newPatient: Patient | null) => void
  open: boolean
  patients: Patient[]
  initial?: Appointment | AppointmentInitialData | null
}

const EMPTY_PATIENT: NewPatient = {
  address: "",
  birthDate: "",
  cpf: "",
  email: "",
  name: "",
  phone: "",
}

export function AppointmentModal({
  open,
  initial,
  patients,
  appointments,
  blocks,
  onClose,
  onSave,
  onCancelAppt,
  addToast,
}: AppointmentModalProps) {
  const isEdit = Boolean(initial && "id" in initial)

  const [patientMode, setPatientMode] = useState<PatientMode>("existing")
  const [patientId, setPatientId] = useState("")
  const [patientSearch, setPatientSearch] = useState("")
  const [newPatient, setNewPatient] = useState<NewPatient>({
    ...EMPTY_PATIENT,
  })

  const [doctorId, setDoctorId] = useState(DOCTORS[0]?.id ?? "")

  const [date, setDate] = useState(todayISO())
  const [start, setStart] = useState("08:00")
  const [duration, setDuration] = useState(30)

  const [reason, setReason] = useState("")

  const [value, setValue] = useState(220)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING")

  const [errors, setErrors] = useState<AppointmentFormErrors>({})

  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  useEffect(() => {
    if (!open) {
      return
    }

    setErrors({})
    setConfirmCancel(false)
    setCancelReason("")
    setPatientSearch("")

    if (initial && "id" in initial) {
      setPatientMode("existing")
      setPatientId(initial.patientId)
      setDoctorId(initial.doctorId)
      setDate(initial.date)
      setStart(initial.start)

      setDuration(toMinutes(initial.end) - toMinutes(initial.start))

      setReason(initial.reason)
      setValue(initial.value)
      setPaymentMethod(initial.paymentMethod)
      setPaymentStatus(initial.paymentStatus)

      return
    }

    setPatientMode("existing")
    setPatientId("")
    setNewPatient({
      ...EMPTY_PATIENT,
    })

    setDoctorId(initial?.doctorId ?? DOCTORS[0]?.id ?? "")

    setDate(initial?.date ?? todayISO())

    setStart(initial?.start ?? "08:00")

    setDuration(30)
    setReason("")
    setValue(220)
    setPaymentMethod("PIX")
    setPaymentStatus("PENDING")
  }, [open, initial])

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase()

    if (!query) {
      return patients
    }

    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.cpf.toLowerCase().includes(query)
    )
  }, [patientSearch, patients])

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === patientId),
    [patients, patientId]
  )

  const end = useMemo(() => addMinutes(start, duration), [start, duration])

  const handleNewPatientChange = (field: keyof NewPatient, value: string) => {
    setNewPatient((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const validate = (): boolean => {
    const validationErrors: AppointmentFormErrors = {}

    if (patientMode === "existing" && !patientId) {
      validationErrors.patient = "Selecione um paciente ou cadastre um novo."
    }

    if (patientMode === "new") {
      if (!newPatient.name.trim()) {
        validationErrors.name = "Informe o nome completo."
      }

      if (!isValidCPFFormat(newPatient.cpf)) {
        validationErrors.cpf = "CPF deve conter 11 dígitos."
      }

      if (!newPatient.birthDate) {
        validationErrors.birthDate = "Informe a data de nascimento."
      }

      if (newPatient.phone.replace(/\D/g, "").length < 10) {
        validationErrors.phone = "Informe um telefone válido."
      }

      if (!newPatient.address.trim()) {
        validationErrors.address = "Informe o endereço."
      }
    }

    if (!doctorId) {
      validationErrors.doctorId = "Selecione o médico."
    }

    if (!date) {
      validationErrors.date = "Selecione a data."
    }

    if (value <= 0) {
      validationErrors.value = "Informe um valor válido."
    }

    const conflict = findConflict({
      appointments,
      blocks,
      doctorId,
      date,
      start,
      end,
      ignoreId: isEdit && initial && "id" in initial ? initial.id : null,
    })

    if (conflict) {
      validationErrors.slot =
        conflict.type === "block"
          ? "O médico está indisponível nesse período."
          : "Já existe um agendamento nesse horário para este médico."
    }

    setErrors(validationErrors)

    return Object.keys(validationErrors).length === 0
  }

  const createPatientRecord = (): Patient => {
    return {
      id: uid("pat"),
      name: newPatient.name.trim(),
      cpf: newPatient.cpf,
      birthDate: newPatient.birthDate,
      phone: newPatient.phone,
      address: newPatient.address,
      email: newPatient.email.trim(),
    }
  }

  const handleSubmit = () => {
    if (!validate()) {
      addToast("Verifique os campos destacados antes de continuar.", "error")

      return
    }

    let finalPatientId = patientId
    let newPatientRecord: Patient | null = null

    if (patientMode === "new") {
      newPatientRecord = createPatientRecord()

      finalPatientId = newPatientRecord.id
    }

    const appointmentId =
      isEdit && initial && "id" in initial ? initial.id : uid("appt")

    const status: AppointmentStatus =
      isEdit && initial && "id" in initial ? initial.status : "CONFIRMED"

    const appointment: Appointment = {
      id: appointmentId,
      patientId: finalPatientId,
      doctorId,
      date,
      start,
      end,
      reason: reason.trim(),
      status,
      value,
      paymentMethod,
      paymentStatus,
    }

    onSave(appointment, newPatientRecord)

    addToast(
      isEdit
        ? "Agendamento atualizado com sucesso."
        : "Agendamento criado com sucesso.",
      "success"
    )

    onClose()
  }

  const handleCancelAppointment = () => {
    if (!initial || !("id" in initial)) {
      return
    }

    onCancelAppt(initial.id, cancelReason)

    addToast("Agendamento cancelado.", "warning")

    setConfirmCancel(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={isEdit ? "Editar agendamento" : "Novo agendamento"}
      onClose={onClose}
      large
      footer={
        <>
          {isEdit &&
            initial &&
            "status" in initial &&
            initial.status !== "CANCELLED" && (
              <button
                type='button'
                className='btn btn-outline-danger btn-sm me-auto'
                onClick={() => setConfirmCancel(true)}
              >
                <i className='bi bi-x-circle me-1' />
                Cancelar agendamento
              </button>
            )}

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
            onClick={handleSubmit}
          >
            <i className='bi bi-check2 me-1' />

            {isEdit ? "Salvar alterações" : "Confirmar agendamento"}
          </button>
        </>
      }
    >
      <div className='section-title'>Paciente</div>

      {!isEdit && (
        <div className='d-flex gap-2 mb-3'>
          <button
            type='button'
            className={`tab-pill ${patientMode === "existing" ? "active" : ""}`}
            onClick={() => setPatientMode("existing")}
          >
            Paciente já cadastrado
          </button>

          <button
            type='button'
            className={`tab-pill ${patientMode === "new" ? "active" : ""}`}
            onClick={() => setPatientMode("new")}
          >
            Cadastrar novo paciente
          </button>
        </div>
      )}

      {patientMode === "existing" ? (
        <>
          <Field label='Buscar por nome ou CPF' error={errors.patient}>
            <input
              type='text'
              className={`form-control ${errors.patient ? "is-invalid" : ""}`}
              value={patientSearch}
              onChange={(event) => setPatientSearch(event.target.value)}
              placeholder='Digite para buscar...'
              disabled={isEdit}
            />
          </Field>

          {!isEdit && (
            <div
              className='mb-3'
              style={{
                maxHeight: 150,
                overflowY: "auto",
                border: "1px solid var(--line)",
                borderRadius: 8,
              }}
            >
              {filteredPatients.length === 0 ? (
                <div className='p-3 text-muted small'>
                  Nenhum paciente encontrado.
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    type='button'
                    key={patient.id}
                    onClick={() => setPatientId(patient.id)}
                    className='d-flex w-100 justify-content-between align-items-center px-3 py-2 border-0'
                    style={{
                      background:
                        patientId === patient.id
                          ? "var(--mint)"
                          : "transparent",
                      borderBottom: "1px solid var(--line)",
                      fontSize: 13.5,
                    }}
                  >
                    <span>{patient.name}</span>

                    <span className='font-mono text-muted'>{patient.cpf}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {isEdit && selectedPatient && (
            <div
              className='p-2 mb-2'
              style={{
                background: "var(--sand)",
                borderRadius: 8,
                fontSize: 13.5,
              }}
            >
              <strong>{selectedPatient.name}</strong> —{" "}
              <span className='font-mono'>{selectedPatient.cpf}</span>
            </div>
          )}
        </>
      ) : (
        <PatientFields
          patient={newPatient}
          onChange={handleNewPatientChange}
          errors={errors}
        />
      )}

      <div className='section-title'>Agendamento</div>

      <div className='row'>
        <div className='col-sm-6'>
          <Field label='Médico(a) *' error={errors.doctorId}>
            <select
              className={`form-select ${errors.doctorId ? "is-invalid" : ""}`}
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
            >
              {DOCTORS.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} — {doctor.specialty}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className='col-sm-6'>
          <Field label='Data *' error={errors.date}>
            <input
              type='date'
              className={`form-control ${errors.date ? "is-invalid" : ""}`}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              min={todayISO()}
            />
          </Field>
        </div>

        <div className='col-sm-4'>
          <Field label='Horário de início *'>
            <select
              className='form-select'
              value={start}
              onChange={(event) => setStart(event.target.value)}
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className='col-sm-4'>
          <Field label='Duração'>
            <select
              className='form-select'
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            >
              <option value={20}>20 min</option>

              <option value={30}>30 min</option>

              <option value={40}>40 min</option>

              <option value={60}>60 min</option>
            </select>
          </Field>
        </div>

        <div className='col-sm-4'>
          <Field label='Término (calculado)'>
            <input
              type='text'
              className='form-control font-mono'
              value={end}
              disabled
              readOnly
            />
          </Field>
        </div>

        {errors.slot && (
          <div className='col-12'>
            <div
              className='p-2 mb-2'
              style={{
                background: "var(--coral-bg)",
                color: "#a12f2f",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <i className='bi bi-exclamation-triangle-fill me-1' />
              {errors.slot}
            </div>
          </div>
        )}

        <div className='col-12'>
          <Field label='Motivo / observações'>
            <textarea
              className='form-control'
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder='Opcional'
            />
          </Field>
        </div>
      </div>

      <div className='section-title'>Pagamento da consulta</div>

      <div className='row'>
        <div className='col-sm-4'>
          <Field label='Valor (R$) *' error={errors.value}>
            <input
              type='number'
              min={0}
              step={10}
              className={`form-control font-mono ${
                errors.value ? "is-invalid" : ""
              }`}
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
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

      <ConfirmDialog
        open={confirmCancel}
        title='Cancelar agendamento'
        message={`Tem certeza que deseja cancelar o agendamento de ${
          selectedPatient?.name ?? "paciente"
        }? Essa ação não pode ser desfeita.`}
        label='Cancelar agendamento'
        variant='coral'
        onCancel={() => setConfirmCancel(false)}
        onConfirm={handleCancelAppointment}
      >
        <div className='mt-3'>
          <label className='field-label'>
            Motivo do cancelamento (opcional)
          </label>

          <input
            type='text'
            className='form-control'
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder='Ex.: paciente remarcou por telefone'
          />
        </div>
      </ConfirmDialog>
    </Modal>
  )
}
