'use client'

import { useEffect } from 'react'
import { useTrackingStore } from '@/store/tracking.store'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { GpsUpdate } from '@/types'

export function useWebSocket() {
  const { updateBusLocation } = useTrackingStore()

  useEffect(() => {
    connectSocket()
    const socket = getSocket()

    socket.on('bus_location_update', (data: GpsUpdate) => {
      updateBusLocation(data.busId, data)
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected')
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
    })

    return () => {
      socket.off('bus_location_update')
      disconnectSocket()
    }
  }, [])
}
