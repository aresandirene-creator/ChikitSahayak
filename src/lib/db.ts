import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaDatabaseUrl: string | undefined;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

export const db =
  globalForPrisma.prisma && globalForPrisma.prismaDatabaseUrl === databaseUrl
    ? globalForPrisma.prisma
    :
  new PrismaClient({
    log: ['query'],
    datasources: { db: { url: databaseUrl } },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaDatabaseUrl = databaseUrl;
}
