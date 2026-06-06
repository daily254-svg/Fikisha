'use client'

import { useQuery } from '@tanstack/react-query'
import { useTrackingStore } from '@/store/tracking.store'
import { trackingService } from '@/services/tracking.service'

export function useTracking(busId: string) {
  const { busLocations } = useTrackingStore()

  const liveLocation = busLocations[busId] ?? null

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['bus-history', busId],
    queryFn: () => trackingService.getBusHistory(busId, 50),
    enabled: !!busId,
  })

  return {
    liveLocation,
    history: history ?? [],
    historyLoading,
    isLive: !!liveLocation,
  }
}
