import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { registerSchema, type RegisterForm } from '@/features/auth/schemas/authSchemas'
import { formatCpf } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const cpfValue = watch('cpf')

  async function onSubmit(data: RegisterForm) {
    setError('')
    try {
      await registerUser({
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
      })
      navigate('/')
    } catch {
      setError('Não foi possível criar a conta')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Cadastre-se como comprador</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={cpfValue ?? ''}
                onChange={(e) => setValue('cpf', formatCpf(e.target.value), { shouldValidate: true })}
              />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
