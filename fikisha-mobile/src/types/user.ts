import { AuthUser } from './auth';
import { RouteStop, Student } from './student';

export interface UserProfile extends AuthUser {
  email?: string;
}

export interface ParentStudentLink {
  relationship: string;
  isPrimary: boolean;
  student: Student;
}

export interface ParentProfile {
  id: string;
  user: UserProfile;
  students: ParentStudentLink[];
}

export interface Bus {
  id: string;
  registrationNumber: string;
  capacity?: number;
  location?: {
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    updatedAt: string;
  };
  routes?: RouteInfo[];
}

export interface RouteInfo {
  id: string;
  name: string;
  direction: 'MORNING' | 'EVENING';
  stops?: RouteStop[];
}

export interface DriverProfile {
  id: string;
  licenseNo?: string | null;
  employeeNo?: string | null;
  createdAt: string;
  user: UserProfile;
  busAssignments: Array<{
    bus: Bus;
  }>;
}

export interface ActiveBusAssignment {
  id: string;
  bus: Bus;
}

export interface RouteStudentEntry extends Student {
  studentRouteId: string;
  pickupStopId?: string | null;
  dropoffStopId?: string | null;
}

export interface RouteStudents {
  route: {
    id: string;
    name: string;
    direction: 'MORNING' | 'EVENING';
    stops: RouteStop[];
  };
  students: RouteStudentEntry[];
}

export type NotificationType =
  | 'BUS_APPROACHING'
  | 'PICKED_UP'
  | 'DROPPED_OFF'
  | 'ABSENT'
  | 'EMERGENCY'
  | 'DELAY';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export type IncidentType = 'DELAY' | 'HAZARD' | 'MECHANICAL' | 'EMERGENCY';

export interface Incident {
  id: string;
  schoolId: string;
  driverId: string;
  busId: string;
  type: IncidentType;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
}

export interface CreateIncidentDto {
  type: IncidentType;
  description: string;
  latitude?: number;
  longitude?: number;
}
