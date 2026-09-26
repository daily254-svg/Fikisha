'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { usersService } from '@/services/users.service'
import { studentsService } from '@/services/students.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function ParentsPage() {
  const queryClient = useQueryClient()
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersService.findAll })
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: studentsService.findAll })
  const parents = users?.filter((u) => u.role === 'PARENT') ?? []
  const [createOpen, setCreateOpen] = useState(false)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const childrenCount = (parentId: string | undefined) =>
    students?.filter((s) => s.parents?.some((ps) => ps.parentId === parentId)).length ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Parents</h1>
          <p className="text-sm text-muted-foreground">
            Parent and guardian accounts. Link them to students from the Students page.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add parent
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Children linked</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !parents.length && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No parents yet.
              </TableCell>
            </TableRow>
          )}
          {parents.map((parent) => (
            <TableRow key={parent.id}>
              <TableCell className="font-medium">{parent.name}</TableCell>
              <TableCell>{parent.phone}</TableCell>
              <TableCell>{childrenCount(parent.parent?.id)}</TableCell>
              <TableCell>
                <Badge variant={parent.status === 'active' ? 'success' : 'outline'}>
                  {parent.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateParentDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={invalidate} />
    </div>
  )
}

function CreateParentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ phone: string } | null>(null)

  const create = useMutation({
    mutationFn: () => usersService.createParent({ name, phone, role: 'PARENT' }),
    onSuccess: () => {
      onCreated()
      setCreated({ phone })
      setName('')
      setPhone('')
      setError('')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to create parent'),
  })

  const close = () => {
    onOpenChange(false)
    setCreated(null)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add parent</DialogTitle>
        </DialogHeader>

        {created ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              Parent account created. Their temporary password is their phone number:
            </p>
            <p className="rounded-md bg-muted px-3 py-2 font-mono text-sm">{created.phone}</p>
            <p className="text-sm text-muted-foreground">
              Link their child from the Students page.
            </p>
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate()
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Adding…' : 'Add parent'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
