import { get } from './api';
import { ENDPOINTS } from '@/constants/api';

export const parentsService = {
  getProfile: () => get(ENDPOINTS.parents.me),
  getStudents: () => get(ENDPOINTS.parents.students),
  getStudentBus: (studentId: string) => get(ENDPOINTS.parents.studentBus(studentId)),
};
