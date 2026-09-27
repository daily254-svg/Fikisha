import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TrackingService } from '../../modules/tracking/tracking.service';
import { GpsUpdateDto } from './dto/gps-update.dto';
import { RouteStartDto } from './dto/route-start.dto';
import { StudentEventDto } from './dto/student-event.dto';
import { SkipThrottle } from '@nestjs/throttler';

interface AuthenticatedSocket extends Socket {
  user?: {
    sub: string;
    schoolId: string;
    role: string;
    phone: string;
  };
}

interface Ack {
  success: boolean;
  error?: string;
  data?: any;
}

@SkipThrottle()
@WebSocketGateway({
  cors: { origin: '*' }, // tighten in production
  namespace: '/tracking',
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  constructor(
    private readonly trackingService: TrackingService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} rejected: no token`);
        client.disconnect();
        return;
      }

      const payload = this.verifyToken(token as string);

      if (!payload) {
        this.logger.warn(`Client ${client.id} rejected: invalid token`);
        client.disconnect();
        return;
      }

      client.user = payload;
      const { schoolId, role, sub } = payload;

      if (role === 'DRIVER') {
        client.join(`driver:${sub}`);
        client.join(`school:${schoolId}:drivers`);
      } else if (role === 'PARENT' || role === 'SCHOOL_ADMIN') {
        // School admins also join the parents room so the admin dashboard
        // receives the same live tracking broadcasts (bus location, pickup/dropoff, route events).
        client.join(`parents:${schoolId}`);
      }

      this.logger.log(
        `Client ${client.id} connected as ${role} in school ${schoolId}`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Connection error: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('gps_update')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleGpsUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: GpsUpdateDto,
  ): Promise<void> {
    if (!client.user) return;

    const { schoolId } = client.user;

    await this.trackingService.handleGpsUpdate(schoolId, payload);

    this.server.to(`parents:${schoolId}`).emit('bus_location_update', {
      busId: payload.busId,
      lat: payload.lat,
      lng: payload.lng,
      speed: payload.speed ?? 0,
      heading: payload.heading ?? 0,
      updatedAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('route_start')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleRouteStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RouteStartDto,
  ): Promise<Ack> {
    if (!client.user) return { success: false, error: 'Not authenticated' };

    const { schoolId, sub } = client.user;

    try {
      const result = await this.trackingService.handleRouteStart(
        schoolId,
        sub,
        payload,
      );

      this.logger.log(
        `Broadcasting route_started to room: parents:${schoolId}`,
      );

      this.server.to(`parents:${schoolId}`).emit('route_started', result);
      this.server
        .to(`school:${schoolId}:drivers`)
        .emit('route_started', result);

      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: this.errorMessage(err) };
    }
  }

  @SubscribeMessage('route_end')
  async handleRouteEnd(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { busId: string },
  ): Promise<Ack> {
    if (!client.user) return { success: false, error: 'Not authenticated' };

    const { schoolId } = client.user;

    try {
      await this.trackingService.handleRouteEnd(schoolId, payload.busId);

      this.server.to(`parents:${schoolId}`).emit('route_ended', {
        busId: payload.busId,
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: this.errorMessage(err) };
    }
  }

  @SubscribeMessage('student_pickup')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleStudentPickup(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: StudentEventDto,
  ): Promise<Ack> {
    if (!client.user) return { success: false, error: 'Not authenticated' };

    try {
      const result = await this.trackingService.handleStudentPickup(
        client.user.schoolId,
        payload,
      );

      this.server
        .to(`parents:${client.user.schoolId}`)
        .emit('student_picked_up', result);

      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: this.errorMessage(err) };
    }
  }

  @SubscribeMessage('student_dropoff')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleStudentDropoff(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: StudentEventDto,
  ): Promise<Ack> {
    if (!client.user) return { success: false, error: 'Not authenticated' };

    try {
      const result = await this.trackingService.handleStudentDropoff(
        client.user.schoolId,
        payload,
      );

      this.server
        .to(`parents:${client.user.schoolId}`)
        .emit('student_dropped_off', result);

      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: this.errorMessage(err) };
    }
  }

  @SubscribeMessage('student_absent')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleStudentAbsent(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: StudentEventDto,
  ): Promise<Ack> {
    if (!client.user) return { success: false, error: 'Not authenticated' };

    try {
      const result = await this.trackingService.handleStudentAbsent(
        client.user.schoolId,
        payload,
      );

      this.server
        .to(`parents:${client.user.schoolId}`)
        .emit('student_marked_absent', result);

      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: this.errorMessage(err) };
    }
  }

  private errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'Something went wrong';
  }

  private verifyToken(token: string): any | null {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}