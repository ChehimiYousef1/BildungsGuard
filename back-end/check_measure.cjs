const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.measure.findFirst({ 
  where: { id: 'cmr2yav4x000g1305mzt14746' },
  select: { id: true, name: true }
}).then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
