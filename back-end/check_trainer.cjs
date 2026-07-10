const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.trainer.findMany({ select: { id: true, name: true }, take: 5 })
  .then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
