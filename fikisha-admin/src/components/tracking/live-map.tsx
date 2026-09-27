'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const busIcon = L.divIcon({
  className: '',
  html: `<div style="background:#1B365D;width:14px;height:14px;border-radius:9999px;border:2px solid white;box-shadow:0 0 0 2px rgba(27,54,93,0.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const stopIcon = L.divIcon({
  className: '',
  html: `<div style="background:#F5C542;width:10px;height:10px;border-radius:9999px;border:2px solid white"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})

export interface MapBusMarker {
  busId: string
  registrationNumber: string
  driverName?: string
  lat: number
  lng: number
  isLive: boolean
}

export interface MapStop {
  id: string
  name: string
  lat: number
  lng: number
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 14)
    } else {
      map.fitBounds(points, { padding: [40, 40] })
    }
  }, [JSON.stringify(points)])

  return null
}

export function LiveMap({
  buses,
  stops = [],
  focusBusId,
}: {
  buses: MapBusMarker[]
  stops?: MapStop[]
  focusBusId?: string | null
}) {
  const focused = focusBusId ? buses.find((b) => b.busId === focusBusId) : null
  const points: [number, number][] = focused
    ? [[focused.lat, focused.lng]]
    : buses.map((b) => [b.lat, b.lng] as [number, number])

  const defaultCenter: [number, number] = points[0] ?? [-1.286389, 36.817223]

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, &copy; OpenStreetMap contributors, and the GIS User Community"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
      />
      <FitBounds points={points} />
      {buses.map((bus) => (
        <Marker key={bus.busId} position={[bus.lat, bus.lng]} icon={busIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium">{bus.registrationNumber}</p>
              {bus.driverName && <p className="text-muted-foreground">{bus.driverName}</p>}
              <p className={bus.isLive ? 'text-emerald-600' : 'text-muted-foreground'}>
                {bus.isLive ? 'Live' : 'Last known location'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
      {stops.map((stop) => (
        <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
          <Popup>{stop.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
