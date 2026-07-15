const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const allAlumni = await prisma.alumni.findMany();
  for (const a of allAlumni) {
    if (a.measure && a.measure.startsWith('cm')) {
      const measure = await prisma.measure.findFirst({ where: { id: a.measure } });
      if (measure) {
        await prisma.alumni.update({ where: { id: a.id }, data: { measure: measure.name } });
        console.log('Fixed:', a.name, '->', measure.name);
      }
    }
  }
  await prisma.$disconnect();
  console.log('DONE');
}

fix();
