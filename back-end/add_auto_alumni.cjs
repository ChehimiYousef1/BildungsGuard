const fs = require('fs');
let s = fs.readFileSync('src/participants/participants.service.ts', 'utf8');

// Find update method
const updateIdx = s.lastIndexOf('async update(');
const updateEnd = s.indexOf('\n  }', updateIdx) + 4;
const oldUpdate = s.slice(updateIdx, updateEnd);
console.log('Found update:', oldUpdate.slice(0, 80));

// Add alumni auto-creation when status = completed
const newUpdate = oldUpdate.replace(
  'return this.prisma.client.participant.update({ where: { id }, data: dto });',
  `const updated = await this.prisma.client.participant.update({ where: { id }, data: dto });
    if (dto.status === 'completed') {
      const measure = updated.measureId
        ? await this.prisma.client.measure.findFirst({ where: { id: updated.measureId } })
        : null;
      const existing = await this.prisma.client.alumni.findFirst({ where: { tenantId, name: updated.name } });
      if (!existing) {
        await this.prisma.client.alumni.create({
          data: {
            name:        updated.name,
            measure:     measure?.name ?? '',
            outcome:     'unknown',
            graduatedAt: new Date().toISOString().slice(0, 10),
            tenantId,
          },
        });
        console.log('[Alumni] Auto-created:', updated.name, '| Bootcamp:', measure?.name ?? '-');
      }
    }
    return updated;`
);

s = s.replace(oldUpdate, newUpdate);
fs.writeFileSync('src/participants/participants.service.ts', s, 'utf8');
console.log('DONE');
