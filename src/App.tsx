import { useCallback, useState } from "react"

import "./App.css"

import {
  SEED_APPOINTMENTS,
  SEED_BLOCKS,
  SEED_PATIENTS,
  SEED_REMINDERS,
} from "./data/mockData"

import type { Patient } from "./types/patient.types"

import { uid, weekdayLong, todayISO } from "./utils/helpers"

import { AppointmentModal } from "./components/AppointmentModal/AppointmentModal"
import { BlockModal } from "./components/BlockModal"
import { ToastStack } from "./components/common/ToastStack"

import { AppointmentSchedulePage } from "./pages/AppointmentSchedule"
import { AppointmentsPage } from "./pages/Appointment"
import { DashboardPage } from "./pages/Dashboard"
import { Appointment } from "./types/appointment.types."

type Page = "dashboard" | "agenda" | "consulta"

type ToastType = "success" | "error" | "warning"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface Reminder {
  id: string
  text: string
  done: boolean
}

interface Block {
  id: string
  doctorId: string
  date: string
  start: string
  end: string
  reason: string
}

interface AppointmentModalState {
  open: boolean
  initial: Appointment | AppointmentInitialData | null
}

interface AppointmentInitialData {
  date?: string
  doctorId?: string
  start?: string
}

interface BlockModalState {
  open: boolean
  doctorId: string | null
  date: string | null
}

const NAV_ITEMS: Array<{
  key: Page
  label: string
  icon: string
}> = [
  {
    key: "dashboard",
    label: "Área de trabalho",
    icon: "bi-grid-1x2-fill",
  },
  {
    key: "agenda",
    label: "Agendamento",
    icon: "bi-calendar2-week-fill",
  },
  {
    key: "consulta",
    label: "Consulta de agendamentos",
    icon: "bi-search",
  },
]

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Área de trabalho",
  agenda: "Agendamento de consultas",
  consulta: "Consulta de agendamentos",
}

const INITIAL_APPOINTMENT_MODAL: AppointmentModalState = {
  open: false,
  initial: null,
}

const INITIAL_BLOCK_MODAL: BlockModalState = {
  open: false,
  doctorId: null,
  date: null,
}

function App() {
  const [page, setPage] = useState<Page>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [patients, setPatients] = useState<Patient[]>(SEED_PATIENTS)
  const [appointments, setAppointments] =
    useState<Appointment[]>(SEED_APPOINTMENTS)
  const [blocks, setBlocks] = useState<Block[]>(SEED_BLOCKS)
  const [reminders, setReminders] = useState<Reminder[]>(SEED_REMINDERS)

  const [toasts, setToasts] = useState<Toast[]>([])

  const [selectedDoctor, setSelectedDoctor] = useState("all")
  const [selectedDate, setSelectedDate] = useState(todayISO())

  const [appointmentModal, setAppointmentModal] =
    useState<AppointmentModalState>(INITIAL_APPOINTMENT_MODAL)

  const [blockModal, setBlockModal] =
    useState<BlockModalState>(INITIAL_BLOCK_MODAL)

  const addToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = uid("toast")

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          type,
        },
      ])

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, 4200)
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const handleNavigate = useCallback((nextPage: Page) => {
    setPage(nextPage)
    setSidebarOpen(false)
  }, [])

  const openAppointment = useCallback(
    (initial?: Appointment | AppointmentInitialData) => {
      setAppointmentModal({
        open: true,
        initial: initial ?? null,
      })
    },
    []
  )

  const closeAppointment = useCallback(() => {
    setAppointmentModal(INITIAL_APPOINTMENT_MODAL)
  }, [])

  const openBlock = useCallback((doctorId?: string, date?: string) => {
    setBlockModal({
      open: true,
      doctorId: doctorId ?? null,
      date: date ?? null,
    })
  }, [])

  const closeBlock = useCallback(() => {
    setBlockModal(INITIAL_BLOCK_MODAL)
  }, [])

  const saveAppointment = useCallback(
    (appointment: Appointment, newPatient: Patient | null) => {
      if (newPatient) {
        setPatients((current) => [...current, newPatient])
      }

      setAppointments((current) => {
        const appointmentExists = current.some(
          (item) => item.id === appointment.id
        )

        if (appointmentExists) {
          return current.map((item) =>
            item.id === appointment.id ? appointment : item
          )
        }

        return [...current, appointment]
      })
    },
    []
  )

  const cancelAppointment = useCallback(
    (appointmentId: string, reason: string) => {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: "CANCELLED",
                cancelReason: reason,
              }
            : appointment
        )
      )
    },
    []
  )

  const updateAppointment = useCallback(
    (appointmentId: string, updates: Partial<Appointment>) => {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                ...updates,
              }
            : appointment
        )
      )
    },
    []
  )

  const saveBlock = useCallback((block: Block) => {
    setBlocks((current) => [...current, block])
  }, [])

  const pageTitle = PAGE_TITLES[page]

  return (
    <div className='app-shell'>
      <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className='brand'>
          <div className='brand-mark'>C+</div>

          <div>
            <div className='brand-name'>Consultório+</div>
            <div className='brand-sub'>Gestão de consultório</div>
          </div>
        </div>

        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type='button'
              className={`nav-item ${page === item.key ? "active" : ""}`}
              onClick={() => handleNavigate(item.key)}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className='app-main'>
        <header className='app-topbar'>
          <div className='d-flex align-items-center gap-2'>
            <button
              type='button'
              className='btn btn-sm btn-outline-secondary d-md-none'
              onClick={() => setSidebarOpen((current) => !current)}
              aria-label='Abrir menu'
            >
              <i className='bi bi-list' />
            </button>

            <div>
              <h1>{pageTitle}</h1>

              <div className='topbar-date text-capitalize'>
                {weekdayLong(todayISO())}
              </div>
            </div>
          </div>

          <div className='d-flex align-items-center gap-2'>
            <span
              className='avatar-circle'
              style={{
                background: "var(--petrol)",
              }}
            >
              RC
            </span>
          </div>
        </header>

        <main className='app-content'>
          {page === "dashboard" && (
            <DashboardPage
              appointments={appointments}
              patients={patients}
              reminders={reminders}
              setReminders={setReminders}
              openAppointment={openAppointment}
            />
          )}

          {page === "agenda" && (
            <AppointmentSchedulePage
              appointments={appointments}
              blocks={blocks}
              patients={patients}
              openAppointment={openAppointment}
              openBlock={openBlock}
              selectedDoctor={selectedDoctor}
              setSelectedDoctor={setSelectedDoctor}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}

          {page === "consulta" && (
            <AppointmentsPage
              appointments={appointments}
              patients={patients}
              updateAppointment={(appointment) =>
                updateAppointment(appointment.id, appointment)
              }
              addToast={addToast}
            />
          )}
        </main>
      </div>

      <AppointmentModal
        open={appointmentModal.open}
        initial={appointmentModal.initial}
        patients={patients}
        appointments={appointments}
        blocks={blocks}
        onSave={saveAppointment}
        onCancelAppt={cancelAppointment}
        onClose={closeAppointment}
        addToast={addToast}
      />

      <BlockModal
        open={blockModal.open}
        defaultDoctorId={blockModal.doctorId ?? undefined}
        defaultDate={blockModal.date ?? undefined}
        appointments={appointments}
        blocks={blocks}
        onSave={saveBlock}
        onClose={closeBlock}
        addToast={addToast}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
