// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // for dev hot-reload:
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  process.env.NODE_ENV === 'production'
    ? new PrismaClient()
    : global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
