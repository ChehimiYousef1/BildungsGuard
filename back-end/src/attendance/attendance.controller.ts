import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  // ⚠️ يجب أن يأتي قبل :sessionId
  @Get('trend')
  @Roles(AppRole.Admin)
  getTrend(@CurrentTenant() tenantId: string) {
    return this.service.getTrend(tenantId);
  }

  @Get('participant/:id')
  forParticipant(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.getForParticipant(tenantId, id);
  }

  @Get(':sessionId')
  forSession(@CurrentTenant() tenantId: string, @Param('sessionId') sessionId: string) {
    return this.service.getForSession(tenantId, sessionId);
  }

  @Post(':sessionId')
  @Roles(AppRole.Admin, AppRole.Trainer)
  submit(@CurrentTenant() tenantId: string, @Param('sessionId') sessionId: string, @Body() dto: SubmitAttendanceDto) {
    return this.service.submit(tenantId, sessionId, dto);
  }
}