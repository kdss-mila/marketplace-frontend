import { useForm } from 'react-hook-form'
import { useAuth } from '@/app/providers/AuthProvider'
import { submitOnboarding } from '@/features/seller-panel/api/sellerApi'
import { formatCep } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

interface OnboardingForm {
  documentType: 'cpf' | 'cnpj'
  document: string
  pixKey: string
  originCep: string
  originAddress: string
}

export function SellerOnboardingPage() {
  const { refreshUser, user } = useAuth()
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm<OnboardingForm>({
    defaultValues: user?.sellerProfile ?? { documentType: 'cpf' },
  })

  async function onSubmit(data: OnboardingForm) {
    await submitOnboarding({ ...data, onboardingComplete: true })
    await refreshUser()
    setSaved(true)
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Onboarding do vendedor</h1>
      {saved && <p className="mb-4 text-green-600">Dados salvos com sucesso!</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Tipo de documento</Label>
          <Select
            value={watch('documentType')}
            onValueChange={(v) => setValue('documentType', v as 'cpf' | 'cnpj')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cnpj">CNPJ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Documento</Label>
          <Input {...register('document', { required: true })} />
        </div>
        <div>
          <Label>Chave Pix</Label>
          <Input {...register('pixKey', { required: true })} />
        </div>
        <div>
          <Label>CEP de origem</Label>
          <Input
            {...register('originCep', { required: true })}
            onChange={(e) => setValue('originCep', formatCep(e.target.value))}
          />
        </div>
        <div>
          <Label>Endereço de origem</Label>
          <Input {...register('originAddress', { required: true })} />
        </div>
        <Button type="submit">Salvar</Button>
      </form>
    </div>
  )
}
