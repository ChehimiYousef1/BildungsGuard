const fs = require('fs');
let c = fs.readFileSync('src/courses/courses.controller.ts', 'utf8');

c = c.replace(
  "import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';",
  "import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';"
);

c = c.replace(
  "  @Get()\n  findAll(@CurrentTenant() tenantId: string) {\n    return this.service.findAll(tenantId);",
  "  @Get()\n  findAll(@CurrentTenant() tenantId: string, @Query('measureId') measureId?: string) {\n    return this.service.findAll(tenantId, measureId);"
);

fs.writeFileSync('src/courses/courses.controller.ts', c, 'utf8');
console.log('DONE');
