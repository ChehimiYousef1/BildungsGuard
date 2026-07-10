const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.document.findMany({ where: { type: 'MEDIA_CONSENT' }, select: { id: true, participantId: true, status: true, tenantId: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
