import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

interface GpsPayload {
  busId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

interface RouteStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

interface StudentEventPayload {
  busId: string;
  studentId: string;
  lat?: number;
  lng?: number;
}

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private readonly LOCATION_TTL = 120; // 2 minutes
  private readonly STOPS_CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleGpsUpdate(schoolId: string, payload: GpsPayload): Promise<void> {
    const locationData = {
      lat: payload.lat,
      lng: payload.lng,
      speed: payload.speed ?? 0,
      heading: payload.heading ?? 0,
      updatedAt: new Date().toISOString(),
    };

    // 1. Store in Redis
    await this.redisService.setex(
      `bus:${payload.busId}:location`,
      this.LOCATION_TTL,
      JSON.stringify(locationData),
    );

    // 2. Broadcast to parents room
    // (Handled by gateway via return value)

    // 3. Save to BusLocation (DB) — fire and forget
    this.saveLocationToDb(schoolId, payload).catch((err) =>
      this.logger.error(`Failed to save location history: ${err.message}`),
    );

    // 4. Run geofence check
    await this.runGeofenceCheck(schoolId, payload.busId, payload.lat, payload.lng);
  }

  async handleRouteStart(
    schoolId: string,
    userId: string,
    payload: { busId: string; routeId: string },
  ): Promise<any> {
    // 1. Verify bus belongs to school
    const bus = await this.prisma.bus.findUnique({
      where: { id: payload.busId },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new Error('Bus not found in this school');
    }

    // 2. Verify route belongs to school
    const route = await this.prisma.route.findUnique({
      where: { id: payload.routeId },
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });

    if (!route || route.schoolId !== schoolId) {
      throw new Error('Route not found in this school');
    }

    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) {
      throw new Error('Driver profile not found');
    }

    // 3. Persist the trip — closing any trip left dangling by a crashed or
    // never-ended previous session on this bus first, so there's never more
    // than one ACTIVE trip per bus.
    const trip = await this.prisma.$transaction(async (tx) => {
      await tx.trip.updateMany({
        where: { busId: payload.busId, status: 'ACTIVE' },
        data: { status: 'COMPLETED', endedAt: new Date() },
      });

      return tx.trip.create({
        data: {
          schoolId,
          busId: payload.busId,
          routeId: payload.routeId,
          driverId: driver.id,
        },
      });
    });

    // 4. Store route assignment in Redis (fast-path cache for geofencing)
    await this.redisService.set(
      `bus:${payload.busId}:route`,
      payload.routeId,
    );

    // 5. Cache stops in Redis
    const stops = route.stops.map((stop) => ({
      id: stop.id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      radiusMeters: stop.radiusMeters,
    }));

    await this.redisService.setex(
      `route:${payload.routeId}:stops`,
      this.STOPS_CACHE_TTL,
      JSON.stringify(stops),
    );

    return { busId: payload.busId, routeId: payload.routeId, tripId: trip.id };
  }

  async getLocationHistory(schoolId: string, busId: string, limit: number = 50) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }

    return this.prisma.busLocationHistory.findMany({
      where: { busId, schoolId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async handleStudentPickup(schoolId: string, payload: StudentEventPayload) {
    const student = await this.prisma.student.findUnique({
      where: { id: payload.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException(`Student with ID ${payload.studentId} not found`);
    }

    const bus = await this.prisma.bus.findUnique({
      where: { id: payload.busId },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new NotFoundException(`Bus with ID ${payload.busId} not found`);
    }

    const event = await this.prisma.transportEvent.create({
      data: {
        schoolId,
        studentId: payload.studentId,
        busId: payload.busId,
        type: 'PICKED_UP',
        latitude: payload.lat,
        longitude: payload.lng,
      },
    });

    await this.notificationsService.sendPickupNotification(payload.studentId);

    return event;
  }

  async handleStudentDropoff(schoolId: string, payload: StudentEventPayload) {
    const student = await this.prisma.student.findUnique({
      where: { id: payload.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException(`Student with ID ${payload.studentId} not found`);
    }

    const bus = await this.prisma.bus.findUnique({
      where: { id: payload.busId },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new NotFoundException(`Bus with ID ${payload.busId} not found`);
    }

    const event = await this.prisma.transportEvent.create({
      data: {
        schoolId,
        studentId: payload.studentId,
        busId: payload.busId,
        type: 'DROPPED_OFF',
        latitude: payload.lat,
        longitude: payload.lng,
      },
    });

    await this.notificationsService.sendDropoffNotification(payload.studentId);

    return event;
  }

  async handleStudentAbsent(schoolId: string, payload: StudentEventPayload) {
    const student = await this.prisma.student.findUnique({
      where: { id: payload.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException(`Student with ID ${payload.studentId} not found`);
    }

    const bus = await this.prisma.bus.findUnique({
      where: { id: payload.busId },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new NotFoundException(`Bus with ID ${payload.busId} not found`);
    }

    const event = await this.prisma.transportEvent.create({
      data: {
        schoolId,
        studentId: payload.studentId,
        busId: payload.busId,
        type: 'ABSENT',
        latitude: payload.lat,
        longitude: payload.lng,
      },
    });

    await this.notificationsService.sendAbsentNotification(payload.studentId);

    return event;
  }

  async handleRouteEnd(_schoolId: string, busId: string): Promise<void> {
    await this.prisma.trip.updateMany({
      where: { busId, status: 'ACTIVE' },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });

    await this.redisService.del(`bus:${busId}:route`);
  }

  async getBusLocation(schoolId: string, busId: string): Promise<any> {
    // Try Redis first
    const cached = await this.redisService.get(`bus:${busId}:location`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to DB
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
      include: { location: true },
    });

    if (!bus || bus.schoolId !== schoolId) {
      return null;
    }

    if (bus.location) {
      return {
        lat: bus.location.latitude,
        lng: bus.location.longitude,
        speed: bus.location.speed,
        heading: bus.location.heading,
        updatedAt: bus.location.updatedAt,
      };
    }

    return null;
  }

  private async runGeofenceCheck(
    schoolId: string,
    busId: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    // Get active route
    const routeId = await this.redisService.get(`bus:${busId}:route`);
    if (!routeId) return;

    // Load stops
    let stops = await this.loadStopsFromCache(routeId);

    if (!stops) {
      stops = await this.loadStopsFromDb(routeId);
      if (!stops || stops.length === 0) return;

      // Cache for future
      await this.redisService.setex(
        `route:${routeId}:stops`,
        this.STOPS_CACHE_TTL,
        JSON.stringify(stops),
      );
    }

    // Check each stop
    for (const stop of stops) {
      const distance = this.haversineDistance(lat, lng, stop.latitude, stop.longitude);

      if (distance <= stop.radiusMeters) {
        await this.notificationsService.sendBusApproachingNotification({
          schoolId,
          busId,
          stopId: stop.id,
          stopName: stop.name,
          distanceMeters: distance,
        });
      }
    }
  }

  private async loadStopsFromCache(routeId: string): Promise<RouteStop[] | null> {
    const cached = await this.redisService.get(`route:${routeId}:stops`);
    return cached ? JSON.parse(cached) : null;
  }

  private async loadStopsFromDb(routeId: string): Promise<RouteStop[]> {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { stops: { orderBy: { sequence: 'asc' } } },
    });

    if (!route) return [];

    return route.stops.map((stop) => ({
      id: stop.id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      radiusMeters: stop.radiusMeters,
    }));
  }

  private async saveLocationToDb(schoolId: string, payload: GpsPayload): Promise<void> {
    // Upsert current location
    await this.prisma.busLocation.upsert({
      where: { busId: payload.busId },
      create: {
        busId: payload.busId,
        schoolId,
        latitude: payload.lat,
        longitude: payload.lng,
        speed: payload.speed,
        heading: payload.heading,
      },
      update: {
        latitude: payload.lat,
        longitude: payload.lng,
        speed: payload.speed,
        heading: payload.heading,
      },
    });

    // Append to history
    await this.prisma.busLocationHistory.create({
      data: {
        schoolId,
        busId: payload.busId,
        latitude: payload.lat,
        longitude: payload.lng,
      },
    });
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}