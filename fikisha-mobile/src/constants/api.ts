export const API_URL = process.env.EXPO_PUBLIC_API_URL
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL
export const SCHOOL_ID = process.env.EXPO_PUBLIC_SCHOOL_ID || ''

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    changePassword: '/auth/change-password',
    fcmToken: '/auth/fcm-token',
  },
  parents: {
    me: '/parents/me',
    students: '/parents/me/students',
    studentBus: (studentId: string) =>
      `/parents/me/students/${studentId}/bus`,
    routes: '/parents/routes',
    selectRoute: (studentId: string) => `/parents/me/students/${studentId}/route`,
  },
  drivers: {
    me: '/drivers/me',
    bus: '/drivers/me/bus',
    routeStudents: '/drivers/me/route/students',
  },
  tracking: {
    busLocation: (busId: string) =>
      `/tracking/buses/${busId}/location`,
    busHistory: (busId: string) =>
      `/tracking/buses/${busId}/history`,
  },
  transportEvents: '/transport-events',
  schools: {
    byId: (schoolId: string) => `/schools/${schoolId}`,
  },
  notifications: {
    mine: '/notifications',
    readAll: '/notifications/read-all',
  },
  incidents: {
    create: '/incidents',
    mine: '/incidents/mine',
  },
} as const
