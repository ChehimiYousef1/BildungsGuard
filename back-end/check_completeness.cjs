const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.participant.findMany({ select: { id: true, name: true, fileCompleteness: true }, take: 5 })
  .then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
