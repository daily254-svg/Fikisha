import { get, post } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { CreateIncidentDto, Incident } from '@/types';

export const incidentsService = {
  create: (dto: CreateIncidentDto): Promise<{ data: Incident }> =>
    post(ENDPOINTS.incidents.create, dto),

  getMine: (limit = 20): Promise<{ data: Incident[] }> =>
    get(ENDPOINTS.incidents.mine, { limit }),
};
