import { IsOptional, IsString, Matches } from 'class-validator';

// Gmail فقط
const GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
// 6+ خانات، حرف واحد على الأقل، رقم واحد، رمز واحد
const STRONG_PW = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export class RegisterOrgDto {
  @IsString() orgName: string;
  @IsString() adminName: string;

  @Matches(GMAIL, { message: 'E-Mail muss eine gültige @gmail.com-Adresse sein.' })
  adminEmail: string;

  @Matches(STRONG_PW, { message: 'Passwort: min. 6 Zeichen, mit Buchstabe, Zahl und Sonderzeichen.' })
  adminPassword: string;

  @IsOptional() @IsString() adminUsername?: string;
}