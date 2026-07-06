import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const ADMIN = { email: 'allinone.admin@gmail.com', username: 'admin', password: 'Admin#2026' };
const TRAINER = { email: 'allinone.trainer@gmail.com', username: 'trainer', password: 'Trainer#2026' };
const PARTICIPANTS = [
  { name: 'Aisha Demir', username: 'aisha', email: 'aisha.demir@gmail.com', password: 'Aisha#2026', fileCompleteness: 100, agency: 'Agentur für Arbeit' },
  { name: 'Jonas Becker', username: 'jonas', email: 'jonas.becker@gmail.com', password: 'Jonas#2026', fileCompleteness: 60, agency: 'Jobcenter' },
];

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' }, update: {},
    create: {
      id: 'demo-tenant', name: 'Omah Bootcamps GmbH', accent: 'iris',
      azavValidUntil: '31.12.2026', certifier: 'CERTQUA', nextAudit: '15.09.2026',
      enabledModules: ['lms', 'qm', 'audit', 'alumni', 'comms'],
    },
  });

  for (const s of [{ ...ADMIN, role: 'admin', name: 'Administration' }, { ...TRAINER, role: 'trainer', name: 'Trainer' }]) {
    const hash = await bcrypt.hash(s.password, 10);
    await prisma.user.upsert({
      where: { email: s.email },
      update: { username: s.username, password: hash, role: s.role as any, name: s.name, tenantId: tenant.id },
      create: { email: s.email, username: s.username, password: hash, role: s.role as any, name: s.name, tenantId: tenant.id },
    });
  }

  const measure = await prisma.measure.create({
    data: {
      name: 'Fachkraft Lagerlogistik', number: 'AZAV-2026-001', azav: 'zugelassen',
      status: 'running', capacity: 20, enrolled: PARTICIPANTS.length, ueHours: 640,
      mode: 'Vollzeit', category: 'Logistik', startDate: '01.03.2026', endDate: '30.11.2026', tenantId: tenant.id,
    },
  });

  for (const p of PARTICIPANTS) {
    await prisma.participant.create({
      data: {
        name: p.name, measureId: measure.id, status: 'enrolled', fileCompleteness: p.fileCompleteness,
        contact: p.email, fundingType: 'Bildungsgutschein', agency: p.agency, tenantId: tenant.id,
      },
    });
    const hash = await bcrypt.hash(p.password, 10);
    await prisma.user.upsert({
      where: { email: p.email },
      update: { username: p.username, password: hash, role: 'participant', name: p.name, tenantId: tenant.id },
      create: { email: p.email, username: p.username, password: hash, role: 'participant', name: p.name, tenantId: tenant.id },
    });
  }

  console.log('Seed complete:');
  console.log(`  Admin   -> ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`  Trainer -> ${TRAINER.email} / ${TRAINER.password}`);
  PARTICIPANTS.forEach((p) => console.log(`  Part.   -> user "${p.username}" or ${p.email} / ${p.password}`));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });