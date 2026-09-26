'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import { Bus as BusIcon } from 'lucide-react'
import { busesService } from '@/services/buses.service'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useTrackingStore } from '@/store/tracking.store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { MapBusMarker } from '@/components/tracking/live-map'

const LiveMap = dynamic(
  () => import('@/components/tracking/live-map').then((m) => m.LiveMap),
  { ssr: false }
)

export default function TrackingPage() {
  useWebSocket()
  const { busLocations } = useTrackingStore()
  const { data: buses } = useQuery({
    queryKey: ['buses'],
    queryFn: busesService.findAll,
    refetchInterval: 15000,
  })
  const [focusBusId, setFocusBusId] = useState<string | null>(null)

  const markers: MapBusMarker[] = useMemo(() => {
    if (!buses) return []
    const result: MapBusMarker[] = []
    for (const bus of buses) {
      const live = busLocations[bus.id]
      const dbLocation = bus.location
      const lat = live?.lat ?? dbLocation?.latitude
      const lng = live?.lng ?? dbLocation?.longitude
      if (lat == null || lng == null) continue
      result.push({
        busId: bus.id,
        registrationNumber: bus.registrationNumber,
        driverName: bus.assignments?.[0]?.driver?.user?.name,
        lat,
        lng,
        isLive: !!live,
      })
    }
    return result
  }, [buses, busLocations])

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Live tracking</h1>
        <p className="text-sm text-muted-foreground">
          Real-time bus locations. Buses without a GPS signal show their last known position.
        </p>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-64 shrink-0 overflow-y-auto rounded-xl border border-border bg-card">
          {!buses?.length && (
            <p className="p-4 text-sm text-muted-foreground">No buses added yet.</p>
          )}
          {buses?.map((bus) => {
            const isLive = !!busLocations[bus.id]
            return (
              <button
                key={bus.id}
                onClick={() => setFocusBusId(bus.id === focusBusId ? null : bus.id)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 border-b border-border px-3 py-3 text-left text-sm transition-colors hover:bg-muted/60',
                  focusBusId === bus.id && 'bg-muted'
                )}
              >
                <div className="flex items-center gap-2">
                  <BusIcon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{bus.registrationNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {bus.assignments?.[0]?.driver?.user?.name ?? 'No driver'}
                    </p>
                  </div>
                </div>
                <Badge variant={isLive ? 'success' : 'outline'}>{isLive ? 'Live' : 'Idle'}</Badge>
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-hidden rounded-xl border border-border">
          <LiveMap buses={markers} focusBusId={focusBusId} />
        </div>
      </div>
    </div>
  )
}
