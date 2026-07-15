const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Show all surveys first
  const all = await prisma.survey.findMany({ select: { id: true, title: true, score: true, participantId: true, type: true } });
  console.log('All surveys:', JSON.stringify(all, null, 2));
}

main().finally(() => prisma.$disconnect());
