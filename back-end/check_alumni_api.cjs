const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.alumni.findMany({ take: 3 })
  .then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
