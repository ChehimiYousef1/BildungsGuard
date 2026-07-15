const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.survey.deleteMany({}).then(r => {
  console.log('Deleted:', r.count, 'surveys');
  return prisma.$disconnect();
});
