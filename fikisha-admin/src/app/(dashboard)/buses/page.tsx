'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil } from 'lucide-react'
import { busesService } from '@/services/buses.service'
import { usersService } from '@/services/users.service'
import { Bus } from '@/types'
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

export default function BusesPage() {
  const queryClient = useQueryClient()
  const { data: buses, isLoading } = useQuery({ queryKey: ['buses'], queryFn: busesService.findAll })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersService.findAll })
  const drivers = users?.filter((u) => u.role === 'DRIVER') ?? []

  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = buses?.find((b) => b.id === editingId) ?? null

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['buses'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Buses</h1>
          <p className="text-sm text-muted-foreground">Manage your fleet and driver assignments.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add bus
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Registration</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead className="w-10"></TableHead>
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
          {!isLoading && !buses?.length && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No buses yet.
              </TableCell>
            </TableRow>
          )}
          {buses?.map((bus) => {
            const assignment = bus.assignments?.[0]
            return (
              <TableRow key={bus.id}>
                <TableCell className="font-medium">{bus.registrationNumber}</TableCell>
                <TableCell>{bus.capacity ?? '—'}</TableCell>
                <TableCell>
                  {assignment?.driver?.user ? (
                    <Badge variant="success">{assignment.driver.user.name}</Badge>
                  ) : (
                    <Badge variant="outline">Unassigned</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(bus.id)}>
                    <Pencil />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <CreateBusDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={invalidate} />

      {editing && (
        <ManageBusDialog
          key={editing.id}
          bus={editing}
          drivers={drivers}
          onOpenChange={(open) => !open && setEditingId(null)}
          onChanged={invalidate}
        />
      )}
    </div>
  )
}

function CreateBusDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [capacity, setCapacity] = useState('')
  const [error, setError] = useState('')

  const create = useMutation({
    mutationFn: () =>
      busesService.create({
        registrationNumber,
        capacity: capacity ? Number(capacity) : undefined,
      }),
    onSuccess: () => {
      onCreated()
      onOpenChange(false)
      setRegistrationNumber('')
      setCapacity('')
      setError('')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to create bus'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add bus</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate()
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="registrationNumber">Registration number</Label>
            <Input
              id="registrationNumber"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="e.g. KDA 123X"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Adding…' : 'Add bus'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ManageBusDialog({
  bus,
  drivers,
  onOpenChange,
  onChanged,
}: {
  bus: Bus
  drivers: { id: string; name: string; phone: string; driver?: { id: string } | null }[]
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}) {
  const [capacity, setCapacity] = useState(bus.capacity?.toString() ?? '')
  const [selectedDriverId, setSelectedDriverId] = useState(
    bus.assignments?.[0]?.driverId ?? ''
  )
  const [error, setError] = useState('')

  const update = useMutation({
    mutationFn: () => busesService.update(bus.id, { capacity: capacity ? Number(capacity) : undefined }),
    onSuccess: onChanged,
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to update bus'),
  })

  const assignDriver = useMutation({
    mutationFn: (driverId: string) => busesService.assignDriver(bus.id, { driverId }),
    onSuccess: onChanged,
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to assign driver'),
  })

  const unassignDriver = useMutation({
    mutationFn: () => busesService.unassignDriver(bus.id),
    onSuccess: () => {
      onChanged()
      setSelectedDriverId('')
    },
  })

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bus.registrationNumber}</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            update.mutate()
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manageBusCapacity">Capacity</Label>
            <Input id="manageBusCapacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <Button type="submit" size="sm" variant="secondary" disabled={update.isPending} className="self-end">
            {update.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>

        <div className="mt-4 border-t border-border pt-4">
          <h3 className="mb-2 text-sm font-medium">Driver assignment</h3>
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
                <option value="">Unassigned</option>
                {drivers.map((d) => (
                  <option key={d.driver?.id} value={d.driver?.id ?? ''}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </Select>
            </div>
            {selectedDriverId ? (
              <Button
                type="button"
                size="sm"
                onClick={() => assignDriver.mutate(selectedDriverId)}
                disabled={assignDriver.isPending}
              >
                Assign
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => unassignDriver.mutate()}
                disabled={!bus.assignments?.length || unassignDriver.isPending}
              >
                Unassign
              </Button>
            )}
          </div>
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
