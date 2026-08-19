import { Appointment } from "../types/appointment.types."
import { Patient } from "../types/patient.types"

import { uid, addMinutes, todayISO, toMinutes } from "../utils/helpers"

export interface Doctor {
  id: string
  name: string
  specialty: string
  color: string
}

export interface Block {
  id: string
  doctorId: string
  date: string
  start: string
  end: string
  reason: string
}

export interface Reminder {
  id: string
  text: string
  done: boolean
}

export const DOCTORS: Doctor[] = [
  {
    id: "doc1",
    name: "Dra. Marina Costa",
    specialty: "Clínica Geral",
    color: "#2b6f6b",
  },
  {
    id: "doc2",
    name: "Dr. Rafael Nunes",
    specialty: "Cardiologia",
    color: "#3f5fb0",
  },
  {
    id: "doc3",
    name: "Dra. Helena Prado",
    specialty: "Dermatologia",
    color: "#b0713f",
  },
]

export const SEED_PATIENTS: Patient[] = [
  {
    id: "pat1",
    name: "Ana Beatriz Silva",
    cpf: "111.222.333-44",
    birthDate: "1990-04-12",
    phone: "(41) 99811-2233",
    address: "Rua das Flores, 120 — Água Verde, Curitiba/PR",
    email: "",
  },
  {
    id: "pat2",
    name: "Carlos Eduardo Lima",
    cpf: "222.333.444-55",
    birthDate: "1985-11-02",
    phone: "(41) 98822-3344",
    address: "Av. Sete de Setembro, 4500 — Batel, Curitiba/PR",
    email: "",
  },
  {
    id: "pat3",
    name: "Fernanda Torres",
    cpf: "333.444.555-66",
    birthDate: "2001-07-19",
    phone: "(41) 99733-4455",
    address: "Rua XV de Novembro, 800 — Centro, Curitiba/PR",
    email: "",
  },
  {
    id: "pat4",
    name: "João Pedro Alves",
    cpf: "444.555.666-77",
    birthDate: "1976-01-30",
    phone: "(41) 99644-5566",
    address: "Rua Mateus Leme, 2020 — São Francisco, Curitiba/PR",
    email: "",
  },
]

const today = todayISO()

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: uid("appt"),
    patientId: "pat1",
    doctorId: "doc1",
    date: today,
    start: "08:30",
    end: "09:00",
    reason: "Consulta de rotina",
    status: "COMPLETED",
    value: 220,
    paymentMethod: "CREDIT_CARD",
    paymentStatus: "PAID",
  },
  {
    id: uid("appt"),
    patientId: "pat2",
    doctorId: "doc2",
    date: today,
    start: "09:00",
    end: "09:40",
    reason: "Retorno — exames",
    status: "COMPLETED",
    value: 280,
    paymentMethod: "PIX",
    paymentStatus: "PAID",
  },
  {
    id: uid("appt"),
    patientId: "pat3",
    doctorId: "doc1",
    date: today,
    start: "10:00",
    end: "10:30",
    reason: "Primeira consulta",
    status: "IN_PROGRESS",
    value: 220,
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
  },
  {
    id: uid("appt"),
    patientId: "pat4",
    doctorId: "doc3",
    date: today,
    start: "11:00",
    end: "11:30",
    reason: "Avaliação de pele",
    status: "CONFIRMED",
    value: 260,
    paymentMethod: "DEBIT_CARD",
    paymentStatus: "PAID",
  },
  {
    id: uid("appt"),
    patientId: "pat2",
    doctorId: "doc1",
    date: today,
    start: "14:00",
    end: "14:30",
    reason: "Retorno",
    status: "WAITING",
    value: 220,
    paymentMethod: "PIX",
    paymentStatus: "PENDING",
  },
  {
    id: uid("appt"),
    patientId: "pat1",
    doctorId: "doc2",
    date: today,
    start: "15:30",
    end: "16:10",
    reason: "Check-up cardíaco",
    status: "CONFIRMED",
    value: 300,
    paymentMethod: "INSURANCE",
    paymentStatus: "PENDING",
  },
]

export const SEED_BLOCKS: Block[] = [
  {
    id: uid("blk"),
    doctorId: "doc3",
    date: today,
    start: "13:00",
    end: "15:00",
    reason: "Almoço estendido / compromisso externo",
  },
]

export const SEED_REMINDERS: Reminder[] = [
  {
    id: uid("rem"),
    text: "Confirmar com a Dra. Helena a troca de sala na quinta-feira.",
    done: false,
  },
  {
    id: uid("rem"),
    text: "Ligar para o laboratório sobre resultado do paciente João Pedro.",
    done: false,
  },
  {
    id: uid("rem"),
    text: "Enviar relatório de faturamento do mês para a contabilidade.",
    done: true,
  },
]

export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = []
  let time = "08:00"

  while (toMinutes(time) <= toMinutes("18:00")) {
    slots.push(time)
    time = addMinutes(time, 30)
  }

  return slots
})()
