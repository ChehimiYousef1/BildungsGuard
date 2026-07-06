import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

// Gmail فقط
const GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
// 6+ خانات، حرف واحد على الأقل، رقم واحد، رمز واحد
const STRONG_PW = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export class RegisterDto {
  @IsString() @MinLength(1) name: string;

  @Matches(GMAIL, { message: 'E-Mail muss eine gültige @gmail.com-Adresse sein.' })
  email: string;

  @Matches(STRONG_PW, { message: 'Passwort: min. 6 Zeichen, mit Buchstabe, Zahl und Sonderzeichen.' })
  password: string;

  @IsOptional() @IsString() username?: string;
}