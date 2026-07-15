const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.participant.findFirst({ where: { name: 'Tara' }, select: { id: true } })
  .then(async p => {
    if (!p) { console.log('Tara not found'); return; }
    console.log('Tara ID:', p.id);
    const del = await prisma.quizAttempt.deleteMany({ where: { participantId: p.id } });
    console.log('Deleted attempts:', del.count);
    const delS = await prisma.survey.deleteMany({ where: { participantId: p.id, type: 'test', title: { contains: 'Quiz' } } });
    console.log('Deleted surveys:', delS.count);
    return prisma.$disconnect();
  });
