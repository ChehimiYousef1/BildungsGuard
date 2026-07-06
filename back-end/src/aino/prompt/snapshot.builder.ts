import { PrismaService } from '../../prisma/prisma.service';

// Builds a PII-conscious snapshot of the tenant's current state for Aino.
export async function buildSnapshot(prisma: PrismaService, tenantId: string): Promise<string> {
  const [tenant, measures, incomplete, openCapa, alumniTotal, alumniEmployed] = await Promise.all([
    prisma.client.tenant.findUnique({ where: { id: tenantId } }),
    prisma.client.measure.findMany({ where: { tenantId } }),
    prisma.client.participant.findMany({ where: { tenantId, fileCompleteness: { lt: 100 } }, select: { name: true, fileCompleteness: true } }),
    prisma.client.capa.findMany({ where: { tenantId, status: { not: 'closed' } } }),
    prisma.client.alumni.count({ where: { tenantId } }),
    prisma.client.alumni.count({ where: { tenantId, outcome: 'employed' } }),
  ]);
  const rate = alumniTotal ? Math.round((alumniEmployed / alumniTotal) * 100) : 0;
  return [
    `Provider: ${tenant?.name ?? 'unknown'} - AZAV approval valid until ${tenant?.azavValidUntil ?? 'n/a'} - certifier ${tenant?.certifier ?? 'n/a'}.`,
    `Measures: ${measures.map((m: any) => `${m.name} (${m.status}, ${m.enrolled}/${m.capacity})`).join('; ') || 'none'}.`,
    `Participants with incomplete files: ${incomplete.map((p: any) => `${p.name} ${p.fileCompleteness}%`).join(', ') || 'none'}.`,
    `Open/overdue complaints (CAPA): ${openCapa.map((c: any) => `"${c.description}" (${c.status}, due ${c.dueDate ?? 'n/a'})`).join(', ') || 'none'}.`,
    `Alumni: ${alumniTotal} graduates, ${alumniEmployed} employed (integration rate ${rate}%).`,
  ].join('\n');
}
