import { remember } from '@epic-web/remember';
import { PrismaClient } from '@prisma/client';

export const db = remember('prisma', () => {
  // NOTE: if you change anything in this function you'll need to restart
  // the dev server to see your changes.

  const client = new PrismaClient();
  void client.$connect();

  return client;
});
