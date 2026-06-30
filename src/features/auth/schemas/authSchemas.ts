import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
