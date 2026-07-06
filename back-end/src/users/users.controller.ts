import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post() @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateUserDto) {
    return this.service.create(tenantId, dto);
  }

  @Get() @Roles(AppRole.Admin)
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id') @Roles(AppRole.Admin)
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id') @Roles(AppRole.Admin)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id') @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
