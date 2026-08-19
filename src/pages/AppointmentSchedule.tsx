import { StatusBadge } from "../components/common/Badges/StatusBadge"
import { Block, DOCTORS, TIME_SLOTS } from "../data/mockData"
import { Appointment } from "../types/appointment.types."
import { Patient } from "../types/patient.types"
import { toMinutes } from "../utils/helpers"

interface AppointmentSchedulePageProps {
  appointments: Appointment[]
  blocks: Block[]
  openAppointment: (appointment: Partial<Appointment> | Appointment) => void
  openBlock: () => void
  patients: Patient[]
  selectedDate: string
  selectedDoctor: string
  setSelectedDate: (date: string) => void
  setSelectedDoctor: (doctorId: string) => void
}

export function AppointmentSchedulePage({
  appointments,
  blocks,
  patients,
  openAppointment,
  openBlock,
  selectedDoctor,
  setSelectedDoctor,
  selectedDate,
  setSelectedDate,
}: AppointmentSchedulePageProps) {
  const doctorsShown =
    selectedDoctor === "all"
      ? DOCTORS
      : DOCTORS.filter((doctor) => doctor.id === selectedDoctor)

  const getPatient = (patientId: string) =>
    patients.find((patient) => patient.id === patientId)

  const getAppointmentsForDoctor = (doctorId: string) =>
    appointments.filter(
      (appointment) =>
        appointment.doctorId === doctorId &&
        appointment.date === selectedDate &&
        appointment.status !== "CANCELLED"
    )

  const getBlocksForDoctor = (doctorId: string) =>
    blocks.filter(
      (block) => block.doctorId === doctorId && block.date === selectedDate
    )

  const renderSlotContent = (doctorId: string) => {
    const doctorAppointments = getAppointmentsForDoctor(doctorId)
    const doctorBlocks = getBlocksForDoctor(doctorId)

    return TIME_SLOTS.slice(0, -1).map((time) => {
      const currentTime = toMinutes(time)

      const appointment = doctorAppointments.find(
        (item) =>
          toMinutes(item.start) <= currentTime &&
          toMinutes(item.end) > currentTime
      )

      if (appointment) {
        if (toMinutes(appointment.start) !== currentTime) {
          return null
        }

        const patient = getPatient(appointment.patientId)

        const duration =
          toMinutes(appointment.end) - toMinutes(appointment.start)

        const rowSpan = duration / 30

        return (
          <div
            key={time}
            className='mb-1'
            style={{ gridRow: `span ${rowSpan}` }}
          >
            <button
              type='button'
              className='appt-chip h-100 w-100 border-0 text-start'
              onClick={() => openAppointment(appointment)}
            >
              <div>
                <div className='appt-patient'>
                  {patient?.name ?? "Paciente não encontrado"}
                </div>

                <div className='appt-meta'>
                  {appointment.start}–{appointment.end}
                  {" · "}
                  {appointment.reason || "Consulta"}
                </div>
              </div>

              <StatusBadge status={appointment.status} />
            </button>
          </div>
        )
      }

      const block = doctorBlocks.find(
        (item) =>
          toMinutes(item.start) <= currentTime &&
          toMinutes(item.end) > currentTime
      )

      if (block) {
        if (toMinutes(block.start) !== currentTime) {
          return null
        }

        const duration = toMinutes(block.end) - toMinutes(block.start)

        const rowSpan = duration / 30

        return (
          <div
            key={time}
            className='mb-1'
            style={{ gridRow: `span ${rowSpan}` }}
          >
            <div className='blocked-slot h-100'>
              <span>
                <i className='bi bi-slash-circle me-1' />
                {block.reason}
              </span>

              <span className='font-mono'>
                {block.start}–{block.end}
              </span>
            </div>
          </div>
        )
      }

      return (
        <button
          key={time}
          type='button'
          className='slot-btn mb-1'
          onClick={() =>
            openAppointment({
              doctorId,
              date: selectedDate,
              start: time,
            })
          }
        >
          <i className='bi bi-plus-lg me-1' />
          {time} — disponível
        </button>
      )
    })
  }

  return (
    <>
      <div className='card-surface p-3 mb-3 d-flex flex-wrap align-items-end gap-3'>
        <div>
          <label htmlFor='appointment-date' className='field-label'>
            Data
          </label>

          <input
            id='appointment-date'
            type='date'
            className='form-control'
            style={{ width: 170 }}
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor='appointment-doctor' className='field-label'>
            Médico(a)
          </label>

          <select
            id='appointment-doctor'
            className='form-select'
            style={{ width: 230 }}
            value={selectedDoctor}
            onChange={(event) => setSelectedDoctor(event.target.value)}
          >
            <option value='all'>Todos os médicos</option>

            {DOCTORS.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        <div className='ms-auto d-flex gap-2'>
          <button
            type='button'
            className='btn btn-outline-petrol btn-sm'
            onClick={openBlock}
          >
            <i className='bi bi-lock-fill me-1' />
            Bloquear período
          </button>

          <button
            type='button'
            className='btn btn-petrol btn-sm'
            onClick={() =>
              openAppointment({
                date: selectedDate,
              })
            }
          >
            <i className='bi bi-plus-lg me-1' />
            Novo agendamento
          </button>
        </div>
      </div>

      <div className='row g-3'>
        {doctorsShown.map((doctor) => (
          <div className='col-lg' key={doctor.id} style={{ minWidth: 260 }}>
            <div className='card-surface p-3'>
              <div className='d-flex align-items-center gap-2 mb-3'>
                <span
                  className='doctor-swatch'
                  style={{
                    background: doctor.color,
                    width: 10,
                    height: 10,
                  }}
                />

                <div>
                  <div className='fw-semibold' style={{ fontSize: 14 }}>
                    {doctor.name}
                  </div>

                  <div className='text-muted' style={{ fontSize: 12 }}>
                    {doctor.specialty}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 2,
                  gridAutoRows: "minmax(38px, auto)",
                }}
              >
                {renderSlotContent(doctor.id)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
