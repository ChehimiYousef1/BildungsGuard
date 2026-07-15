const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.survey.findMany({ where: { participantId: 'cmr5b2iaz000a39m6qs7n70fp' } })
  .then(r => { console.log('Surveys:', JSON.stringify(r.map(s => ({id:s.id,type:s.type,title:s.title,score:s.score})))); return prisma.$disconnect(); });
