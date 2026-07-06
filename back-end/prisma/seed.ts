import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

// ---- Fixed staff logins (replace with your real Gmail addresses) ----
const ADMIN_EMAIL = 'allinone.admin@gmail.com';
const ADMIN_PASSWORD = 'Admin#2026';
const TRAINER_EMAIL = 'allinone.trainer@gmail.com';
const TRAINER_PASSWORD = 'Trainer#2026';

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' },
    update: {},
    create: {
      id: 'demo-tenant', name: 'Omah Bootcamps GmbH', accent: 'iris',
      azavValidUntil: '31.12.2026', certifier: 'CERTQUA', nextAudit: '15.09.2026',
      enabledModules: ['lms', 'qm', 'audit', 'alumni', 'comms'],
    },
  });

  // Administration — one fixed account
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: await bcrypt.hash(ADMIN_PASSWORD, 10), role: 'admin', name: 'Administration', tenantId: tenant.id },
    create: { email: ADMIN_EMAIL, password: await bcrypt.hash(ADMIN_PASSWORD, 10), role: 'admin', name: 'Administration', tenantId: tenant.id },
  });

  // Trainer — one fixed account
  await prisma.user.upsert({
    where: { email: TRAINER_EMAIL },
    update: { password: await bcrypt.hash(TRAINER_PASSWORD, 10), role: 'trainer', name: 'Trainer', tenantId: tenant.id },
    create: { email: TRAINER_EMAIL, password: await bcrypt.hash(TRAINER_PASSWORD, 10), role: 'trainer', name: 'Trainer', tenantId: tenant.id },
  });

  // A measure participants can be assigned to (kept for the Measures screen)
  await prisma.measure.create({
    data: {
      name: 'Fachkraft Lagerlogistik', number: 'AZAV-2026-001', azav: 'zugelassen',
      status: 'running', capacity: 20, enrolled: 0, ueHours: 640,
      mode: 'Vollzeit', category: 'Logistik', startDate: '01.03.2026', endDate: '30.11.2026',
      tenantId: tenant.id,
    },
  });

  console.log('Seed complete:');
  console.log(`  Admin   -> ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Trainer -> ${TRAINER_EMAIL} / ${TRAINER_PASSWORD}`);
  console.log('  Participants: none seeded — they self-register.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });