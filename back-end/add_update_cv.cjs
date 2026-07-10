const fs = require('fs');
let s = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

const lastClose = s.lastIndexOf('}');
const method = `
  async updateCvRef(id: string, cvRef: string) {
    try {
      return await this.prisma.client.trainer.update({
        where: { id },
        data: { cvRef },
      });
    } catch (e) {
      console.error('[updateCvRef] error:', e);
      throw e;
    }
  }
`;

s = s.slice(0, lastClose) + method + '}';
fs.writeFileSync('src/trainers/trainers.service.ts', s, 'utf8');
console.log('DONE');
console.log('Has updateCvRef:', s.includes('updateCvRef'));
