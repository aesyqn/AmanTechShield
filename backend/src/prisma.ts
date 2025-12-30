import prismaPkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is not set in the environment');
}

const adapter = new PrismaPg({ connectionString });
const { PrismaClient } = prismaPkg;

export const prisma = new PrismaClient({ adapter });
