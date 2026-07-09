const fs = require('fs');
let c = fs.readFileSync('src/participants/dto/create-participants.dto.ts', 'utf8');

c = c.replace(
  "import { IsInt, IsOptional, IsString } from 'class-validator';",
  "import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';"
);

c = c.replace(
  "  @IsOptional() @IsString()\n  password?: string;\n}",
  "  @IsOptional() @IsString()\n  password?: string;\n\n  @IsOptional() @IsBoolean()\n  sendWelcomeEmail?: boolean;\n}"
);

fs.writeFileSync('src/participants/dto/create-participants.dto.ts', c, 'utf8');
console.log('DONE');
