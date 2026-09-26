'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil } from 'lucide-react'
import { studentsService } from '@/services/students.service'
import { usersService } from '@/services/users.service'
import { Student } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
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

export default function StudentsPage() {
  const queryClient = useQueryClient()
  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentsService.findAll,
  })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersService.findAll })
  const parents = users?.filter((u) => u.role === 'PARENT') ?? []

  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = students?.find((s) => s.id === editingId) ?? null

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['students'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage enrolled students and their parent links.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add student
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Admission No.</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Parents</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !students?.length && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No students yet. Add your first student to get started.
              </TableCell>
            </TableRow>
          )}
          {students?.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.firstName} {student.lastName}
              </TableCell>
              <TableCell>{student.admissionNo}</TableCell>
              <TableCell>{student.grade ?? '—'}</TableCell>
              <TableCell>
                {student.parents?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {student.parents.map((ps) => (
                      <Badge key={ps.parentId} variant="secondary">
                        {ps.parent?.user?.name ?? ps.parent?.user?.phone}
                        {ps.isPrimary ? ' (primary)' : ''}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">None linked</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(student.id)}>
                  <Pencil />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateStudentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={invalidate}
      />

      {editing && (
        <ManageStudentDialog
          key={editing.id}
          student={editing}
          parents={parents}
          onOpenChange={(open) => !open && setEditingId(null)}
          onChanged={invalidate}
        />
      )}
    </div>
  )
}

function CreateStudentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [admissionNo, setAdmissionNo] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [grade, setGrade] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')

  const create = useMutation({
    mutationFn: () =>
      studentsService.create({
        admissionNo,
        firstName,
        lastName,
        grade: grade || undefined,
        gender: gender || undefined,
      }),
    onSuccess: () => {
      onCreated()
      onOpenChange(false)
      setAdmissionNo('')
      setFirstName('')
      setLastName('')
      setGrade('')
      setGender('')
      setError('')
    },
    onError: (err: any) =>
      setError(err?.response?.data?.message ?? 'Failed to create student'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add student</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate()
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admissionNo">Admission number</Label>
            <Input id="admissionNo" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. Grade 4" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Not set</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Adding…' : 'Add student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ManageStudentDialog({
  student,
  parents,
  onOpenChange,
  onChanged,
}: {
  student: Student
  parents: { id: string; name: string; phone: string; parent?: { id: string } | null }[]
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}) {
  const [firstName, setFirstName] = useState(student.firstName)
  const [lastName, setLastName] = useState(student.lastName)
  const [grade, setGrade] = useState(student.grade ?? '')
  const [selectedParentId, setSelectedParentId] = useState('')
  const [relationship, setRelationship] = useState('')
  const [error, setError] = useState('')

  const update = useMutation({
    mutationFn: () =>
      studentsService.update(student.id, { firstName, lastName, grade: grade || undefined }),
    onSuccess: onChanged,
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to update student'),
  })

  const linkParent = useMutation({
    mutationFn: () =>
      studentsService.linkParent(student.id, {
        parentId: selectedParentId,
        relationship,
      }),
    onSuccess: () => {
      onChanged()
      setSelectedParentId('')
      setRelationship('')
      setError('')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to link parent'),
  })

  const unlinkParent = useMutation({
    mutationFn: (parentId: string) => studentsService.unlinkParent(student.id, parentId),
    onSuccess: onChanged,
  })

  const availableParents = parents.filter(
    (p) => !student.parents?.some((ps) => ps.parentId === p.parent?.id)
  )

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {student.firstName} {student.lastName}
          </DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            update.mutate()
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editFirstName">First name</Label>
              <Input id="editFirstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editLastName">Last name</Label>
              <Input id="editLastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editGrade">Grade</Label>
            <Input id="editGrade" value={grade} onChange={(e) => setGrade(e.target.value)} />
          </div>
          <Button type="submit" size="sm" variant="secondary" disabled={update.isPending} className="self-end">
            {update.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>

        <div className="mt-4 border-t border-border pt-4">
          <h3 className="mb-2 text-sm font-medium">Linked parents</h3>
          <div className="flex flex-col gap-2">
            {student.parents?.length ? (
              student.parents.map((ps) => (
                <div
                  key={ps.parentId}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {ps.parent?.user?.name} · {ps.relationship}
                    {ps.isPrimary ? ' · primary' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => unlinkParent.mutate(ps.parentId)}
                  >
                    Unlink
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No parents linked yet.</p>
            )}
          </div>

          <form
            className="mt-3 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (selectedParentId && relationship) linkParent.mutate()
            }}
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="linkParentSelect">Link a parent</Label>
              <Select id="linkParentSelect" value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)}>
                <option value="">Select parent…</option>
                {availableParents.map((p) => (
                  <option key={p.parent?.id} value={p.parent?.id ?? ''}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="relationshipInput">Relationship</Label>
              <Input
                id="relationshipInput"
                placeholder="e.g. Mother"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={linkParent.isPending}>
              Link
            </Button>
          </form>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
