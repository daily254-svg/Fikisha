import { useEffect } from 'react'
import { useTrackingStore } from '@/store/tracking.store'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { GpsUpdate } from '@/types'

export function useWebSocket() {
  const { updateBusLocation } = useTrackingStore()

  useEffect(() => {
    let mounted = true

    const setup = async () => {
      await connectSocket()
      const socket = await getSocket()

      if (!mounted) return

      socket.on('bus_location_update', (data: GpsUpdate) => {
        updateBusLocation(data.busId, data)
      })

      socket.on('connect', () => console.log('[Socket] Connected'))
      socket.on('disconnect', () => console.log('[Socket] Disconnected'))
    }

    setup()

    return () => {
      mounted = false
      disconnectSocket()
    }
  }, [])
}
