const fs = require('fs');
let s = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');
const lastClose = s.lastIndexOf('}');
const method = `
  async updateCvRef(id: string, cvRef: string) {
    return this.prisma.client.trainer.update({ where: { id }, data: { cvRef } });
  }
`;
s = s.slice(0, lastClose) + method + '}';
fs.writeFileSync('src/trainers/trainers.service.ts', s, 'utf8');
console.log('DONE - count:', (s.match(/updateCvRef/g)||[]).length);
