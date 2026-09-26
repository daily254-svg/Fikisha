'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { routesService } from '@/services/routes.service'
import { busesService } from '@/services/buses.service'
import { studentsService } from '@/services/students.service'
import { CreateStopDto, Route } from '@/types'
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

export default function RoutesPage() {
  const queryClient = useQueryClient()
  const { data: routes, isLoading } = useQuery({ queryKey: ['routes'], queryFn: routesService.findAll })
  const { data: buses } = useQuery({ queryKey: ['buses'], queryFn: busesService.findAll })

  const [createOpen, setCreateOpen] = useState(false)
  const [managingId, setManagingId] = useState<string | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['routes'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Routes</h1>
          <p className="text-sm text-muted-foreground">
            Define pickup/dropoff stops and assign students.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add route
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Bus</TableHead>
            <TableHead>Stops</TableHead>
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
          {!isLoading && !routes?.length && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No routes yet.
              </TableCell>
            </TableRow>
          )}
          {routes?.map((route) => (
            <TableRow key={route.id}>
              <TableCell className="font-medium">{route.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{route.direction}</Badge>
              </TableCell>
              <TableCell>{route.bus?.registrationNumber ?? '—'}</TableCell>
              <TableCell>{route.stops?.length ?? 0}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon-sm" onClick={() => setManagingId(route.id)}>
                  <Pencil />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateRouteDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        buses={buses ?? []}
        onCreated={invalidate}
      />

      {managingId && (
        <ManageRouteDialog
          routeId={managingId}
          buses={buses ?? []}
          onOpenChange={(open) => !open && setManagingId(null)}
          onChanged={invalidate}
        />
      )}
    </div>
  )
}

function CreateRouteDialog({
  open,
  onOpenChange,
  buses,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  buses: { id: string; registrationNumber: string }[]
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [direction, setDirection] = useState<'MORNING' | 'EVENING'>('MORNING')
  const [busId, setBusId] = useState('')
  const [stops, setStops] = useState<CreateStopDto[]>([
    { name: '', latitude: 0, longitude: 0, sequence: 1, radiusMeters: 150 },
  ])
  const [error, setError] = useState('')

  const create = useMutation({
    mutationFn: () =>
      routesService.create({
        name,
        direction,
        busId: busId || undefined,
        stops: stops.map((s, i) => ({ ...s, sequence: i + 1 })),
      }),
    onSuccess: () => {
      onCreated()
      onOpenChange(false)
      setName('')
      setDirection('MORNING')
      setBusId('')
      setStops([{ name: '', latitude: 0, longitude: 0, sequence: 1, radiusMeters: 150 }])
      setError('')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to create route'),
  })

  const updateStop = (index: number, patch: Partial<CreateStopDto>) => {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add route</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate()
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 flex flex-col gap-1.5">
              <Label htmlFor="routeName">Name</Label>
              <Input id="routeName" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="routeDirection">Direction</Label>
              <Select id="routeDirection" value={direction} onChange={(e) => setDirection(e.target.value as 'MORNING' | 'EVENING')}>
                <option value="MORNING">Morning</option>
                <option value="EVENING">Evening</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="routeBusId">Bus (optional)</Label>
              <Select id="routeBusId" value={busId} onChange={(e) => setBusId(e.target.value)}>
                <option value="">None</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.registrationNumber}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Stops (in order)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setStops((prev) => [
                    ...prev,
                    { name: '', latitude: 0, longitude: 0, sequence: prev.length + 1, radiusMeters: 150 },
                  ])
                }
              >
                <Plus />
                Add stop
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {stops.map((stop, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
                  <Input
                    placeholder={`Stop ${i + 1} name`}
                    value={stop.name}
                    onChange={(e) => updateStop(i, { name: e.target.value })}
                    required
                  />
                  <Input
                    className="w-24"
                    type="number"
                    step="any"
                    placeholder="Lat"
                    value={stop.latitude || ''}
                    onChange={(e) => updateStop(i, { latitude: parseFloat(e.target.value) })}
                    required
                  />
                  <Input
                    className="w-24"
                    type="number"
                    step="any"
                    placeholder="Lng"
                    value={stop.longitude || ''}
                    onChange={(e) => updateStop(i, { longitude: parseFloat(e.target.value) })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={stops.length === 1}
                    onClick={() => setStops((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Adding…' : 'Add route'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ManageRouteDialog({
  routeId,
  buses,
  onOpenChange,
  onChanged,
}: {
  routeId: string
  buses: { id: string; registrationNumber: string }[]
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}) {
  const queryClient = useQueryClient()
  const { data: route } = useQuery({
    queryKey: ['routes', routeId],
    queryFn: () => routesService.findById(routeId),
  })
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: studentsService.findAll })

  const [newStopName, setNewStopName] = useState('')
  const [newStopLat, setNewStopLat] = useState('')
  const [newStopLng, setNewStopLng] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [pickupStopId, setPickupStopId] = useState('')
  const [error, setError] = useState('')

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['routes', routeId] })
    onChanged()
  }

  const addStop = useMutation({
    mutationFn: () =>
      routesService.addStop(routeId, {
        name: newStopName,
        latitude: parseFloat(newStopLat),
        longitude: parseFloat(newStopLng),
        sequence: (route?.stops?.length ?? 0) + 1,
      }),
    onSuccess: () => {
      refresh()
      setNewStopName('')
      setNewStopLat('')
      setNewStopLng('')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to add stop'),
  })

  const removeStop = useMutation({
    mutationFn: (stopId: string) => routesService.removeStop(routeId, stopId),
    onSuccess: refresh,
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to remove stop'),
  })

  const assignStudent = useMutation({
    mutationFn: () =>
      routesService.assignStudent(routeId, {
        studentId: selectedStudentId,
        pickupStopId: pickupStopId || undefined,
      }),
    onSuccess: () => {
      refresh()
      setSelectedStudentId('')
      setPickupStopId('')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Failed to assign student'),
  })

  const unassignStudent = useMutation({
    mutationFn: (studentId: string) => routesService.unassignStudent(routeId, studentId),
    onSuccess: refresh,
  })

  if (!route) return null

  const availableStudents = students?.filter(
    (s) => !route.students?.some((rs) => rs.studentId === s.id)
  )

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {route.name} <span className="text-muted-foreground">· {route.direction}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Stops</h3>
            <div className="flex flex-col gap-2">
              {route.stops?.map((stop) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {stop.sequence}. {stop.name} ({stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)})
                  </span>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeStop.mutate(stop.id)}>
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
              <Input placeholder="Stop name" value={newStopName} onChange={(e) => setNewStopName(e.target.value)} />
              <Input className="w-24" type="number" step="any" placeholder="Lat" value={newStopLat} onChange={(e) => setNewStopLat(e.target.value)} />
              <Input className="w-24" type="number" step="any" placeholder="Lng" value={newStopLng} onChange={(e) => setNewStopLng(e.target.value)} />
              <Button
                type="button"
                size="sm"
                disabled={!newStopName || !newStopLat || !newStopLng || addStop.isPending}
                onClick={() => addStop.mutate()}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-2 text-sm font-medium">Assigned students</h3>
            <div className="flex flex-col gap-2">
              {route.students?.length ? (
                route.students.map((rs) => (
                  <div
                    key={rs.studentId}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {rs.student?.firstName} {rs.student?.lastName} ({rs.student?.admissionNo})
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => unassignStudent.mutate(rs.studentId)}>
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No students assigned yet.</p>
              )}
            </div>
            <div className="mt-2 flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                  <option value="">Select student…</option>
                  {availableStudents?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Select value={pickupStopId} onChange={(e) => setPickupStopId(e.target.value)}>
                  <option value="">Pickup stop (optional)</option>
                  {route.stops?.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={!selectedStudentId || assignStudent.isPending}
                onClick={() => assignStudent.mutate()}
              >
                Assign
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
