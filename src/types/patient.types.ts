export type Patient ={
  id: string
  address: string
  birthDate: string
  cpf: string
  email: string
  name: string
  phone: string
}

export type NewPatient = Omit<
  Patient,
  "id"
>