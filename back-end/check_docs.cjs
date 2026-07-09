const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.document.groupBy({ by: ['status'], _count: true })
  .then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); })
  .catch(e => { console.error(e); return prisma.$disconnect(); });
