import { SetMetadata } from '@nestjs/common';

export const RIGHTS_KEY = 'rights';
export const Rights = (...rights: string[]) => SetMetadata(RIGHTS_KEY, rights);
