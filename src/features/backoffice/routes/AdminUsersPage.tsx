import { useEffect, useState } from 'react'
import { banUser, getAdminUsers } from '@/features/backoffice/api/adminApi'
import type { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])

  async function load() {
    setUsers(await getAdminUsers())
  }

  useEffect(() => {
    void load()
  }, [])

  async function toggleBan(user: User) {
    await banUser(user.id, !user.banned)
    await load()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Usuários</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.banned ? 'destructive' : 'secondary'}>
                  {user.banned ? 'Banido' : 'Ativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => toggleBan(user)}>
                  {user.banned ? 'Desbanir' : 'Banir'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
