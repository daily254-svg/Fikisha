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
  user: UserProfile;
  busAssignments: Array<{
    bus: Bus;
  }>;
}

export interface ActiveBusAssignment {
  id: string;
  bus: Bus;
}

export interface RouteStudents {
  route: {
    id: string;
    name: string;
    direction: 'MORNING' | 'EVENING';
  };
  students: Student[];
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  date: string;
  read: boolean;
}
