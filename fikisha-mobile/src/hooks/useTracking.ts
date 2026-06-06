import { useTrackingStore } from '@/store/tracking.store'
import { trackingService } from '@/services/tracking.service'
import { useEffect, useState } from 'react'
import { BusLocationResponse } from '@/types'

export function useTracking(busId: string | null) {
  const { busLocations } = useTrackingStore()
  const [dbLocation, setDbLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const liveLocation = busId ? busLocations[busId] ?? null : null

  useEffect(() => {
    if (!busId || liveLocation) return

    // Only fetch from DB if no live location in store
    setIsLoading(true)
    trackingService.getBusLocation(busId)
      .then(setDbLocation)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [busId, liveLocation])

  return {
    liveLocation,
    dbLocation,
    isLive: !!liveLocation,
    isLoading,
  }
}
