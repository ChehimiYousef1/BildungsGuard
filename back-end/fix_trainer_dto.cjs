const fs = require('fs');
let c = fs.readFileSync('src/trainers/dto/create-trainers.dto.ts', 'utf8');

c = c.replace(
  "  @IsOptional() @IsString()\n  expiry?: string;\n}",
  "  @IsOptional() @IsString()\n  expiry?: string;\n\n  @IsOptional() @IsString()\n  email?: string;\n\n  @IsOptional() @IsString()\n  password?: string;\n}"
);

fs.writeFileSync('src/trainers/dto/create-trainers.dto.ts', c, 'utf8');
console.log('DONE');
