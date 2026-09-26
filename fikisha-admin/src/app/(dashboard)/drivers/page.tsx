'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { usersService } from '@/services/users.service'
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

export default function DriversPage() {
  const queryClient = useQueryClient()
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersService.findAll })
  const drivers = users?.filter((u) => u.role === 'DRIVER') ?? []
  const [createOpen, setCreateOpen] = useState(false)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Drivers</h1>
          <p className="text-sm text-muted-foreground">
            Drivers assigned to buses on your fleet.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add driver
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>License No.</TableHead>
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
          {!isLoading && !drivers.length && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No drivers yet.
              </TableCell>
            </TableRow>
          )}
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-medium">{driver.name}</TableCell>
              <TableCell>{driver.phone}</TableCell>
              <TableCell>{driver.driver?.employeeNo ?? driver.driver?.licenseNo ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={driver.status === 'active' ? 'success' : 'outline'}>
                  {driver.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateDriverDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={invalidate} />
    </div>
  )
}

function CreateDriverDialog({
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
  const [licenseNo, setLicenseNo] = useState('')
  const [employeeNo, setEmployeeNo] = useState('')
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ phone: string } | null>(null)

  const create = useMutation({
    mutationFn: () =>
      usersService.createDriver({
        name,
        phone,
        role: 'DRIVER',
        licenseNo: licenseNo || undefined,
        employeeNo: employeeNo || undefined,
      }),
    onSuccess: () => {
      onCreated()
      setCreated({ phone })
      setName('')
      setPhone('')
      setLicenseNo('')
      setEmployeeNo('')
      setError('')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to create driver'),
  })

  const close = () => {
    onOpenChange(false)
    setCreated(null)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add driver</DialogTitle>
        </DialogHeader>

        {created ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              Driver created. Their temporary password is their phone number:
            </p>
            <p className="rounded-md bg-muted px-3 py-2 font-mono text-sm">{created.phone}</p>
            <p className="text-sm text-muted-foreground">
              They&apos;ll be asked to change it on first login to the mobile app.
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="licenseNo">License no.</Label>
                <Input id="licenseNo" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="employeeNo">Employee no.</Label>
                <Input id="employeeNo" value={employeeNo} onChange={(e) => setEmployeeNo(e.target.value)} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Adding…' : 'Add driver'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
