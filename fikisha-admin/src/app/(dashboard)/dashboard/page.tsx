'use client'

import { useQuery } from '@tanstack/react-query'
import { GraduationCap, UserCog, Users, Bus as BusIcon, Route as RouteIcon } from 'lucide-react'
import { studentsService } from '@/services/students.service'
import { usersService } from '@/services/users.service'
import { busesService } from '@/services/buses.service'
import { routesService } from '@/services/routes.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: studentsService.findAll })
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersService.findAll })
  const { data: buses } = useQuery({ queryKey: ['buses'], queryFn: busesService.findAll })
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: routesService.findAll })

  const drivers = users?.filter((u) => u.role === 'DRIVER') ?? []
  const parents = users?.filter((u) => u.role === 'PARENT') ?? []
  const busesWithDriver = buses?.filter((b) => b.assignments?.length) ?? []

  const stats = [
    { label: 'Students', value: students?.length ?? 0, icon: GraduationCap },
    { label: 'Drivers', value: drivers.length, icon: UserCog },
    { label: 'Parents', value: parents.length, icon: Users },
    { label: 'Buses', value: buses?.length ?? 0, icon: BusIcon },
    { label: 'Routes', value: routes?.length ?? 0, icon: RouteIcon },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of your school&apos;s transport operations.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold">{s.value}</p>
              </div>
              <s.icon className="size-8 text-muted-foreground/40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          {!buses?.length && (
            <p className="text-sm text-muted-foreground">No buses added yet.</p>
          )}
          {buses?.map((bus) => {
            const assignment = bus.assignments?.[0]
            return (
              <div
                key={bus.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <BusIcon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{bus.registrationNumber}</span>
                </div>
                {assignment?.driver?.user ? (
                  <Badge variant="success">Driver: {assignment.driver.user.name}</Badge>
                ) : (
                  <Badge variant="outline">Unassigned</Badge>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {busesWithDriver.length} of {buses?.length ?? 0} buses currently have an assigned driver.
      </p>
    </div>
  )
}
