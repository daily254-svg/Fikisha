import { SetMetadata } from '@nestjs/common';

export const SCHOOL_SCOPED_KEY = 'schoolScoped';
export const SchoolScoped = () => SetMetadata(SCHOOL_SCOPED_KEY, true);