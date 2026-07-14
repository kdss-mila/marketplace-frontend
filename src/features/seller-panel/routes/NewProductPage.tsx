import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { listCategories } from '@/features/catalog/api/catalogApi'
import { createSellerProduct } from '@/features/seller-panel/api/sellerApi'
import type { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormData {
  title: string
  description: string
  categoryId: string
  price: number
  stock: number
  imageUrl: string
}

export function NewProductPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: { imageUrl: 'https://picsum.photos/seed/new/600/600' },
  })

  useEffect(() => {
    listCategories().then(setCategories)
  }, [])

  async function onSubmit(data: FormData) {
    await createSellerProduct({
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      brand: 'Outros',
      price: Number(data.price),
      stock: Number(data.stock),
      images: [data.imageUrl],
      weight: 0.5,
      dimensions: { width: 20, height: 10, length: 15 },
    })
    navigate('/vendedor/anuncios')
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Novo anúncio</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Título</Label>
          <Input {...register('title', { required: true })} />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea {...register('description', { required: true })} />
        </div>
        <div>
          <Label>Categoria</Label>
          <Select value={watch('categoryId')} onValueChange={(v) => setValue('categoryId', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Preço (R$)</Label>
            <Input type="number" step="0.01" {...register('price', { required: true })} />
          </div>
          <div>
            <Label>Estoque</Label>
            <Input type="number" {...register('stock', { required: true })} />
          </div>
        </div>
        <div>
          <Label>URL da imagem</Label>
          <Input {...register('imageUrl')} />
        </div>
        <Button type="submit">Publicar anúncio</Button>
      </form>
    </div>
  )
}
