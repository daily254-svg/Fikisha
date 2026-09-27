'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { routesService } from '@/services/routes.service'
import type { GeocodeResult } from '@/types'

// This module is only ever loaded client-side via next/dynamic({ ssr: false }),
// same as components/tracking/live-map.tsx, so touching `window` here is safe.
const pickIcon = L.divIcon({
  className: '',
  html: `<div style="background:#F5C542;width:18px;height:18px;border-radius:9999px;border:3px solid #1B365D;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})
const referenceIcon = L.divIcon({
  className: '',
  html: `<div style="background:#CBD5E1;width:8px;height:8px;border-radius:9999px;border:2px solid white"></div>`,
  iconSize: [8, 8],
  iconAnchor: [4, 4],
})

interface FlyTarget {
  lat: number
  lng: number
  nonce: number
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyTo({ target }: { target: FlyTarget | null }) {
  const map = useMap()
  useEffect(() => {
    if (!target) return
    map.flyTo([target.lat, target.lng], 16)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.nonce])
  return null
}

export interface StopMapPickerProps {
  latitude: number | null
  longitude: number | null
  onPick: (lat: number, lng: number) => void
  otherStops?: { id: string; name: string; latitude: number; longitude: number }[]
  height?: number
}

export function StopMapPicker({
  latitude,
  longitude,
  onPick,
  otherStops = [],
  height = 280,
}: StopMapPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const defaultCenter: [number, number] =
    latitude != null && longitude != null
      ? [latitude, longitude]
      : otherStops[0]
        ? [otherStops[0].latitude, otherStops[0].longitude]
        : [-1.286389, 36.817223]

  const runSearch = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 3) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await routesService.geocode(value)
        setResults(Array.isArray(data) ? data : [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 500)
  }

  const pickResult = (result: GeocodeResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    onPick(lat, lng)
    setFlyTarget({ lat, lng, nonce: Date.now() })
    setResults([])
    setQuery(result.display_name)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search for an address or area…"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setQuery('')
              setResults([])
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {(results.length > 0 || searching) && (
          <div className="absolute z-[1000] mt-1 w-full rounded-md border border-border bg-popover shadow-md">
            {searching && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
            )}
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => pickResult(r)}
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-border" style={{ height }}>
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
          <ClickHandler onPick={onPick} />
          <FlyTo target={flyTarget} />
          {otherStops.map((s) => (
            <Marker key={s.id} position={[s.latitude, s.longitude]} icon={referenceIcon} />
          ))}
          {latitude != null && longitude != null && (
            <Marker
              position={[latitude, longitude]}
              icon={pickIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const pos = (e.target as L.Marker).getLatLng()
                  onPick(pos.lat, pos.lng)
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Search an address, click the map, or drag the pin to set this stop&apos;s exact location.
      </p>
    </div>
  )
}
