import { get } from './api';
import { ENDPOINTS } from '@/constants/api';

export interface School {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const schoolsService = {
  getSchool: (schoolId: string): Promise<{ data: School }> =>
    get(ENDPOINTS.schools.byId(schoolId)),
};
