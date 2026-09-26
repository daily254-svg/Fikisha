import React, { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { Bus } from 'lucide-react-native';

export interface MapStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
}

interface RouteMapProps {
  stops: MapStop[];
  busLocation?: { lat: number; lng: number } | null;
  /** Fixed height in px. Omit to have the map fill its parent container. */
  height?: number;
}

function regionFor(
  points: { latitude: number; longitude: number }[],
): Region | undefined {
  if (points.length === 0) return undefined;

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat, 0.01) * 1.6,
    longitudeDelta: Math.max(maxLng - minLng, 0.01) * 1.6,
  };
}

export function RouteMap({ stops, busLocation, height }: RouteMapProps) {
  const mapRef = useRef<MapView>(null);

  const points = useMemo(() => {
    const stopPoints = stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude }));
    if (busLocation) {
      stopPoints.push({ latitude: busLocation.lat, longitude: busLocation.lng });
    }
    return stopPoints;
  }, [stops, busLocation]);

  const initialRegion = regionFor(points) ?? {
    latitude: -1.286389,
    longitude: 36.817223,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const sortedStops = [...stops].sort((a, b) => a.sequence - b.sequence);

  return (
    <View style={[styles.container, height ? { height } : styles.fill]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
      >
        {sortedStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={`${stop.sequence}. ${stop.name}`}
            pinColor="#F5C542"
          />
        ))}

        {sortedStops.length > 1 && (
          <Polyline
            coordinates={sortedStops.map((s) => ({
              latitude: s.latitude,
              longitude: s.longitude,
            }))}
            strokeColor="#F5C542"
            strokeWidth={4}
          />
        )}

        {busLocation && (
          <Marker
            coordinate={{ latitude: busLocation.lat, longitude: busLocation.lng }}
            title="Bus"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.busMarker}>
              <Bus size={16} color="#F5C542" />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#E8F4FD',
  },
  fill: {
    flex: 1,
  },
  busMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B365D',
    borderWidth: 3,
    borderColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
