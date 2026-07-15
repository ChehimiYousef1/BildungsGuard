const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.participant.findMany({ 
  select: { name: true, status: true, measureId: true },
  take: 10 
}).then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
