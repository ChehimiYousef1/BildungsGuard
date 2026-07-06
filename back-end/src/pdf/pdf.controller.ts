import { Controller, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('pdf')
export class PdfController {
  constructor(private readonly service: PdfService) {}

  @Post('certificate/:participantId')
  async certificate(@CurrentTenant() tenantId: string, @Param('participantId') id: string, @Res() res: Response) {
    const pdf = await this.service.certificate(tenantId, id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="certificate-${id}.pdf"` });
    res.end(pdf);
  }

  @Post('ergebnisbogen/:participantId')
  async ergebnisbogen(@CurrentTenant() tenantId: string, @Param('participantId') id: string, @Res() res: Response) {
    const pdf = await this.service.ergebnisbogen(tenantId, id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="ergebnisbogen-${id}.pdf"` });
    res.end(pdf);
  }

  @Post('bundle/participants')
  async participantBundle(@CurrentTenant() tenantId: string, @Res() res: Response) {
    const pdf = await this.service.participantBundle(tenantId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="teilnehmer-bundle.pdf"` });
    res.end(pdf);
  }

  @Post('bundle/measures')
  async measureBundle(@CurrentTenant() tenantId: string, @Res() res: Response) {
    const pdf = await this.service.measureBundle(tenantId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="massnahmen-bundle.pdf"` });
    res.end(pdf);
  }

  @Post('bundle/funding')
  async fundingBundle(@CurrentTenant() tenantId: string, @Res() res: Response) {
    const pdf = await this.service.fundingBundle(tenantId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="abrechnung-bundle.pdf"` });
    res.end(pdf);
  }
}3