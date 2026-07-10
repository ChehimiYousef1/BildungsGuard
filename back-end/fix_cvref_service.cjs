const fs = require('fs');
let s = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

s = s.replace(
  "  async updateCvRef(id: string, cvRef: string) {\n    return this.prisma.client.trainer.update({ where: { id }, data: { cvRef } });\n  }",
  "  async updateCvRef(id: string, cvRef: string) {\n    // Try direct id first, then by userId via user.name lookup\n    let trainer = await this.prisma.client.trainer.findFirst({ where: { id } });\n    if (!trainer) {\n      // id might be a userId - find trainer by matching user email/name\n      const user = await this.prisma.client.user.findFirst({ where: { id }, select: { name: true, email: true } });\n      if (user) trainer = await this.prisma.client.trainer.findFirst({ where: { name: user.name } });\n    }\n    if (!trainer) throw new Error('Trainer not found for id: ' + id);\n    return this.prisma.client.trainer.update({ where: { id: trainer.id }, data: { cvRef } });\n  }"
);

fs.writeFileSync('src/trainers/trainers.service.ts', s, 'utf8');
console.log('DONE');
