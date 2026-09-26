import { get } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { ParentProfile, ParentStudentLink, StudentBusLocationResponse } from '@/types';

export const parentsService = {
  getProfile: (): Promise<{ data: ParentProfile }> => get(ENDPOINTS.parents.me),
  getStudents: (): Promise<{ data: ParentStudentLink[] }> => get(ENDPOINTS.parents.students),
  getStudentBus: (studentId: string): Promise<{ data: StudentBusLocationResponse }> =>
    get(ENDPOINTS.parents.studentBus(studentId)),
};
