import { useMemo, useState, type KeyboardEvent } from "react"
import { Appointment } from "../types/appointment.types."
import { Patient } from "../types/patient.types"
import { DOCTORS, Reminder } from "../data/mockData"
import { formatCurrency, uid, weekdayLong, todayISO, toMinutes} from "../utils/helpers"
import { KpiCard } from "../components/common/KPICard"
import { StatusBadge } from "../components/common/Badges/StatusBadge"

interface DashboardPageProps {
  appointments: Appointment[]
  openAppointment: (appointment: Appointment) => void
  patients: Patient[]
  reminders: Reminder[]
  setReminders: (reminders: Reminder[]) => void
}

export function DashboardPage({
  appointments,
  patients,
  reminders,
  setReminders,
  openAppointment,
}: DashboardPageProps) {
  const today = todayISO()

  const [newReminder, setNewReminder] = useState("")

  const todaysAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.date === today)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
  }, [appointments, today])

  const attendedAppointments = useMemo(
    () =>
      todaysAppointments.filter(
        (appointment) => appointment.status === "COMPLETED"
      ),
    [todaysAppointments]
  )

  const cancelledAppointments = useMemo(
    () =>
      todaysAppointments.filter(
        (appointment) => appointment.status === "CANCELLED"
      ),
    [todaysAppointments]
  )

  const pendingPayments = useMemo(
    () =>
      todaysAppointments.filter(
        (appointment) =>
          appointment.paymentStatus === "PENDING" &&
          appointment.status !== "CANCELLED"
      ),
    [todaysAppointments]
  )

  const dailyRevenue = useMemo(
    () =>
      todaysAppointments
        .filter((appointment) => appointment.paymentStatus === "PAID")
        .reduce((total, appointment) => total + appointment.value, 0),
    [todaysAppointments]
  )

  const currentTimePercentage = useMemo(() => {
    const now = new Date()

    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const dayStart = toMinutes("08:00")

    const dayEnd = toMinutes("18:00")

    return ((currentMinutes - dayStart) / (dayEnd - dayStart)) * 100
  }, [])

  const addReminder = () => {
    const text = newReminder.trim()

    if (!text) {
      return
    }

    const reminder: Reminder = {
      id: uid("rem"),
      text,
      done: false,
    }

    setReminders([reminder, ...reminders])

    setNewReminder("")
  }

  const handleReminderKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addReminder()
    }
  }

  const toggleReminder = (reminderId: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === reminderId
          ? {
              ...reminder,
              done: !reminder.done,
            }
          : reminder
      )
    )
  }

  const removeReminder = (reminderId: string) => {
    setReminders(reminders.filter((reminder) => reminder.id !== reminderId))
  }

  return (
    <>
      <div className='row g-3 mb-2'>
        <div className='col-sm-6 col-lg-3'>
          <KpiCard
            icon='bi-calendar2-check'
            label='Agendamentos hoje'
            value={todaysAppointments.length}
            details={`${cancelledAppointments.length} cancelado(s)`}
          />
        </div>

        <div className='col-sm-6 col-lg-3'>
          <KpiCard
            icon='bi-person-check'
            label='Pacientes atendidos'
            value={attendedAppointments.length}
            details={`de ${todaysAppointments.length} agendados`}
          />
        </div>

        <div className='col-sm-6 col-lg-3'>
          <KpiCard
            icon='bi-cash-coin'
            label='Faturamento do dia'
            value={formatCurrency(dailyRevenue)}
            details={`${pendingPayments.length} pagamento(s) pendente(s)`}
          />
        </div>

        <div className='col-sm-6 col-lg-3'>
          <KpiCard
            icon='bi-people'
            label='Médicos em atendimento'
            value={DOCTORS.length}
            details={weekdayLong(today)}
          />
        </div>
      </div>

      <div className='row g-3 mt-1'>
        <div className='col-lg-7'>
          <div className='card-surface p-3 p-md-4'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <h2 className='h6 mb-0'>Agenda de hoje</h2>

              <span className='text-muted small text-capitalize'>
                {weekdayLong(today)}
              </span>
            </div>

            {todaysAppointments.length === 0 ? (
              <div className='empty-state'>
                <i className='bi bi-calendar-x' />
                Nenhum agendamento para hoje.
              </div>
            ) : (
              <div className='day-rail'>
                {currentTimePercentage >= 0 && currentTimePercentage <= 100 && (
                  <div
                    className='day-rail-now'
                    style={{
                      top: `${currentTimePercentage}%`,
                    }}
                  />
                )}

                {todaysAppointments.map((appointment) => {
                  const patient = patients.find(
                    (item) => item.id === appointment.patientId
                  )

                  const doctor = DOCTORS.find(
                    (item) => item.id === appointment.doctorId
                  )

                  return (
                    <div className='day-rail-slot' key={appointment.id}>
                      <span className='day-rail-time'>{appointment.start}</span>

                      <button
                        type='button'
                        className='appt-chip'
                        style={{
                          borderLeftColor: doctor?.color,
                        }}
                        onClick={() => openAppointment(appointment)}
                      >
                        <div>
                          <div className='appt-patient'>
                            {patient?.name ?? "Paciente não encontrado"}
                          </div>

                          <div className='appt-meta'>
                            {doctor?.name ?? "Médico não encontrado"}
                            {" · "}
                            {appointment.reason || "Consulta"}
                          </div>
                        </div>

                        <StatusBadge status={appointment.status} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className='col-lg-5'>
          <div className='card-surface p-3 p-md-4'>
            <h2 className='h6 mb-3'>Avisos e lembretes</h2>

            <div className='d-flex gap-2 mb-3'>
              <input
                type='text'
                className='form-control form-control-sm'
                placeholder='Novo lembrete...'
                value={newReminder}
                onChange={(event) => setNewReminder(event.target.value)}
                onKeyDown={handleReminderKeyDown}
              />

              <button
                type='button'
                className='btn btn-petrol btn-sm'
                onClick={addReminder}
                aria-label='Adicionar lembrete'
              >
                <i className='bi bi-plus-lg' />
              </button>
            </div>

            {reminders.length === 0 && (
              <div className='empty-state py-3'>
                <i className='bi bi-bell-slash' />
                Sem avisos por aqui.
              </div>
            )}

            {reminders.map((reminder) => (
              <div className='reminder-item' key={reminder.id}>
                <input
                  type='checkbox'
                  className='form-check-input mt-1'
                  checked={reminder.done}
                  onChange={() => toggleReminder(reminder.id)}
                  aria-label={`Marcar lembrete "${reminder.text}" como concluído`}
                />

                <span
                  style={{
                    flex: 1,
                    fontSize: 13.5,
                    textDecoration: reminder.done ? "line-through" : "none",
                    color: reminder.done ? "var(--slate-muted)" : "var(--ink)",
                  }}
                >
                  {reminder.text}
                </span>

                <button
                  type='button'
                  className='btn btn-sm btn-link text-danger p-0'
                  onClick={() => removeReminder(reminder.id)}
                  aria-label={`Remover lembrete "${reminder.text}"`}
                >
                  <i className='bi bi-trash3' />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
