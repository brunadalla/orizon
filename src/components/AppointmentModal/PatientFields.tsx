import type { ChangeEvent } from "react"

import type { NewPatient } from "../../types/patient.types"

import { maskCPF, maskPhone, todayISO } from "../../utils/helpers"

import { Field } from "../common/Field"

interface PatientFieldsProps {
  patient: NewPatient
  onChange: (field: keyof NewPatient, value: string) => void
  errors: Partial<Record<keyof NewPatient, string>>
}

export function PatientFields({
  patient,
  onChange,
  errors,
}: PatientFieldsProps) {
  const handleChange =
    (field: keyof NewPatient) => (event: ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value

      if (field === "cpf") {
        value = maskCPF(value)
      }

      if (field === "phone") {
        value = maskPhone(value)
      }

      onChange(field, value)
    }

  return (
    <div className='row'>
      <div className='col-12'>
        <Field label='Nome completo *' error={errors.name}>
          <input
            type='text'
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={patient.name}
            onChange={handleChange("name")}
            placeholder='Ex.: Maria da Silva'
            autoComplete='name'
          />
        </Field>
      </div>

      <div className='col-sm-6'>
        <Field label='CPF *' error={errors.cpf}>
          <input
            type='text'
            className={`form-control font-mono ${
              errors.cpf ? "is-invalid" : ""
            }`}
            value={patient.cpf}
            onChange={handleChange("cpf")}
            placeholder='000.000.000-00'
            inputMode='numeric'
            maxLength={14}
            autoComplete='off'
          />
        </Field>
      </div>

      <div className='col-sm-6'>
        <Field label='Data de nascimento *' error={errors.birthDate}>
          <input
            type='date'
            className={`form-control ${errors.birthDate ? "is-invalid" : ""}`}
            value={patient.birthDate}
            onChange={handleChange("birthDate")}
            max={todayISO()}
            autoComplete='bday'
          />
        </Field>
      </div>

      <div className='col-sm-6'>
        <Field label='Telefone *' error={errors.phone}>
          <input
            type='tel'
            className={`form-control ${errors.phone ? "is-invalid" : ""}`}
            value={patient.phone}
            onChange={handleChange("phone")}
            placeholder='(00) 00000-0000'
            inputMode='numeric'
            maxLength={15}
            autoComplete='tel'
          />
        </Field>
      </div>

      <div className='col-sm-6'>
        <Field label='E-mail'>
          <input
            type='email'
            className='form-control'
            value={patient.email}
            onChange={handleChange("email")}
            placeholder='Opcional'
            autoComplete='email'
          />
        </Field>
      </div>

      <div className='col-12'>
        <Field label='Endereço *' error={errors.address}>
          <input
            type='text'
            className={`form-control ${errors.address ? "is-invalid" : ""}`}
            value={patient.address}
            onChange={handleChange("address")}
            placeholder='Rua, número — bairro, cidade/UF'
            autoComplete='street-address'
          />
        </Field>
      </div>
    </div>
  )
}
