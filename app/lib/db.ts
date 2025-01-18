import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient();

// @todo: Need to introduce singleton here
