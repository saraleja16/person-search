import { PrismaClient } from '@prisma/client';

declare global {
  // allow attaching to globalThis in dev
  var prisma: PrismaClient | undefined;
}

// Use a single instance in development to avoid hot-reload issues
const prismaClient = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV === 'development') globalThis.prisma = prismaClient;

export default prismaClient;
