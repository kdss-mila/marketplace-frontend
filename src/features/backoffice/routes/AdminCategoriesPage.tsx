import { useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from '@/features/backoffice/api/adminApi'
import type { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function load() {
    setCategories(await getAdminCategories())
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleCreate() {
    if (!name.trim()) return
    await createCategory({ name: name.trim(), parentId: null })
    setName('')
    await load()
  }

  async function handleUpdate(id: string) {
    await updateCategory(id, { name: editName, parentId: null })
    setEditingId(null)
    await load()
  }

  async function handleDelete(id: string) {
    await deleteCategory(id)
    await load()
  }

  function parentName(parentId: string | null) {
    if (!parentId) return '—'
    return categories.find((c) => c.id === parentId)?.name ?? parentId
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categorias</h1>
      <div className="mb-6 flex gap-2">
        <Input placeholder="Nova categoria" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={handleCreate}>Adicionar</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Pai</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>
                {editingId === cat.id ? (
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                ) : (
                  cat.name
                )}
              </TableCell>
              <TableCell>{parentName(cat.parentId)}</TableCell>
              <TableCell className="flex gap-2">
                {editingId === cat.id ? (
                  <Button size="sm" onClick={() => handleUpdate(cat.id)}>
                    Salvar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(cat.id)
                      setEditName(cat.name)
                    }}
                  >
                    Editar
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
