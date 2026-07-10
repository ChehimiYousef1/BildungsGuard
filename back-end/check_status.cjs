const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.measure.findMany({ select: { name: true, status: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
