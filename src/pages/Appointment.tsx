import { useCallback, useMemo, useState } from "react"
import { Appointment } from "../types/appointment.types."
import { Patient } from "../types/patient.types"
import { DOCTORS } from "../data/mockData"
import { formatCurrency, formatDateBR, todayISO } from "../utils/helpers"
import { PayBadge } from "../components/common/Badges/PayBadge"
import { StatusBadge } from "../components/common/Badges/StatusBadge"
import { DetailsModal } from "../components/DetailsModal"
import { STATUS_LABELS } from "../utils/constants"

type AppointmentRange = "today" | "week" | "all"

interface AppointmentsPageProps {
  appointments: Appointment[]
  patients: Patient[]
  updateAppointment: (appointment: Appointment) => void
  addToast: (message: string, type: ToastType) => void
}

type ToastType = "success" | "error" | "warning"

export function AppointmentsPage({
  appointments,
  patients,
  updateAppointment,
  addToast,
}: AppointmentsPageProps) {
  const [search, setSearch] = useState("")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [rangeFilter, setRangeFilter] = useState<AppointmentRange>("today")
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)

  const isWithinRange = useCallback(
    (date: string) => {
      if (rangeFilter === "all") {
        return true
      }

      if (rangeFilter === "today") {
        return date === todayISO()
      }

      const appointmentDate = new Date(`${date}T00:00:00`)
      const currentDate = new Date()

      currentDate.setHours(0, 0, 0, 0)

      const differenceInDays =
        (appointmentDate.getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24)

      return differenceInDays >= -6 && differenceInDays <= 0
    },
    [rangeFilter]
  )

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return appointments
      .filter((appointment) => isWithinRange(appointment.date))
      .filter(
        (appointment) =>
          doctorFilter === "all" || appointment.doctorId === doctorFilter
      )
      .filter(
        (appointment) =>
          statusFilter === "all" || appointment.status === statusFilter
      )
      .filter((appointment) => {
        if (!query) {
          return true
        }

        const patient = patients.find(
          (item) => item.id === appointment.patientId
        )

        if (!patient) {
          return false
        }

        return (
          patient.name.toLowerCase().includes(query) ||
          patient.cpf.includes(query)
        )
      })
      .sort((first, second) =>
        `${second.date}${second.start}`.localeCompare(
          `${first.date}${first.start}`
        )
      )
  }, [
    appointments,
    patients,
    search,
    doctorFilter,
    statusFilter,
    isWithinRange,
  ])

  const rangeOptions: Array<{
    value: AppointmentRange
    label: string
  }> = [
    {
      value: "today",
      label: "Hoje",
    },
    {
      value: "week",
      label: "Últimos 7 dias",
    },
    {
      value: "all",
      label: "Todos",
    },
  ]

  return (
    <>
      <div className='card-surface p-3 mb-3 d-flex flex-wrap align-items-end gap-3'>
        <div style={{ flex: "1 1 220px" }}>
          <label htmlFor='patient-search' className='field-label'>
            Buscar paciente
          </label>

          <input
            id='patient-search'
            type='search'
            className='form-control'
            placeholder='Nome ou CPF...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor='doctor-filter' className='field-label'>
            Médico(a)
          </label>

          <select
            id='doctor-filter'
            className='form-select'
            style={{ width: 210 }}
            value={doctorFilter}
            onChange={(event) => setDoctorFilter(event.target.value)}
          >
            <option value='all'>Todos</option>

            {DOCTORS.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor='status-filter' className='field-label'>
            Status
          </label>

          <select
            id='status-filter'
            className='form-select'
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value='all'>Todos</option>

            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className='d-flex gap-2 ms-auto'>
          {rangeOptions.map(({ value, label }) => (
            <button
              key={value}
              type='button'
              className={`tab-pill ${rangeFilter === value ? "active" : ""}`}
              onClick={() => setRangeFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className='card-surface' style={{ overflow: "hidden" }}>
        {filteredAppointments.length === 0 ? (
          <div className='empty-state'>
            <i className='bi bi-search' />
            Nenhum agendamento encontrado para os filtros selecionados.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Data / Horário</th>
                  <th>Médico</th>
                  <th>Valor</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => {
                  const patient = patients.find(
                    (item) => item.id === appointment.patientId
                  )

                  const doctor = DOCTORS.find(
                    (item) => item.id === appointment.doctorId
                  )

                  return (
                    <tr
                      key={appointment.id}
                      onClick={() => setSelectedAppointment(appointment)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div className='d-flex align-items-center gap-2'>
                          <span
                            className='avatar-circle'
                            style={{
                              background: doctor?.color,
                            }}
                          >
                            {patient?.name?.[0]?.toUpperCase()}
                          </span>

                          <div>
                            <div className='fw-semibold'>
                              {patient?.name ?? "Paciente não encontrado"}
                            </div>

                            <div
                              className='text-muted font-mono'
                              style={{ fontSize: 11.5 }}
                            >
                              {patient?.cpf}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className='font-mono'>
                        {formatDateBR(appointment.date)}
                        {" · "}
                        {appointment.start}
                      </td>

                      <td>
                        <span
                          className='doctor-swatch'
                          style={{
                            background: doctor?.color,
                          }}
                        />

                        {doctor?.name ?? "Médico não encontrado"}
                      </td>

                      <td className='font-mono'>
                        {formatCurrency(appointment.value)}
                      </td>

                      <td>
                        <PayBadge status={appointment.paymentStatus} />
                      </td>

                      <td>
                        <StatusBadge status={appointment.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DetailsModal
        appointment={selectedAppointment}
        patients={patients}
        onClose={() => setSelectedAppointment(null)}
        updateAppointment={(appointmentId, updates) => {
          const appointment = appointments.find(
            (item) => item.id === appointmentId
          )

          if (appointment) {
            updateAppointment({ ...appointment, ...updates })
          }
        }}
        addToast={addToast}
      />
    </>
  )
}
