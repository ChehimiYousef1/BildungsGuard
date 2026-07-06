import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.prisma.findUserForAuth(identifier);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    const { password: _pw, resetToken: _rt, resetTokenExpiry: _re, ...safe } = user;
    return safe;
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  async register(dto: { name: string; email: string; password: string; username?: string }) {
    if (await this.prisma.findUserForAuth(dto.email)) {
      throw new ConflictException('Email already registered');
    }
    if (dto.username && (await this.prisma.findUserForAuth(dto.username))) {
      throw new ConflictException('Username already taken');
    }

    // ابحث عن participant موجود بنفس الإيميل عبر كل التينانتات (بدون RLS)
    const existingParticipant = await this.prisma.findParticipantByContact(dto.email);

    // لو وُجد → استعمل تينانته (= شركة ids)، لو لا → التينانت الافتراضي
    const tenantId = existingParticipant?.tenantId
      ?? this.config.get<string>('defaultTenantId');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.runAsTenant(tenantId, async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hash,
          role: 'participant',
          name: dto.name,
          tenantId,
        },
      });
      // لو ما في participant موجود، أنشئ واحدًا
      if (!existingParticipant) {
        await tx.participant.create({
          data: {
            name: dto.name,
            status: 'enrolled',
            fileCompleteness: 0,
            contact: dto.email,
            tenantId,
          },
        });
      }
      return created;
    });

    const { password: _pw, resetToken: _rt, resetTokenExpiry: _re, ...safe } = user;
    return this.issueTokens(safe);
  }

  async registerOrganization(dto: {
    orgName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    adminUsername?: string;
  }) {
    if (await this.prisma.findUserForAuth(dto.adminEmail)) {
      throw new ConflictException('Email already registered');
    }
    if (dto.adminUsername && (await this.prisma.findUserForAuth(dto.adminUsername))) {
      throw new ConflictException('Username already taken');
    }

    const hash = await bcrypt.hash(dto.adminPassword, 10);

    const user = await this.prisma.createTenantWithAdmin({
      orgName: dto.orgName,
      admin: {
        name: dto.adminName,
        email: dto.adminEmail,
        username: dto.adminUsername,
        password: hash,
      },
    });

    const { password: _pw, resetToken: _rt, resetTokenExpiry: _re, ...safe } = user;
    return this.issueTokens(safe);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
      const user = await this.prisma.findUserById(payload.sub);
      if (!user) throw new UnauthorizedException();
      const { password: _pw, resetToken: _rt, resetTokenExpiry: _re, ...safe } = user;
      return this.issueTokens(safe);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.findUserForAuth(email);
    if (user) {
      const token = randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 30 * 60 * 1000);
      await this.prisma.updateUserScoped(user.id, user.tenantId, {
        resetToken: token,
        resetTokenExpiry: expiry,
      });
      const url = `${this.config.get<string>('frontendUrl')}/reset-password?token=${token}`;
      this.logger.log(`Password reset link for ${user.email}: ${url}`);
      try {
        await this.mail.send(
          user.email,
          'All in One – Passwort zurücksetzen',
          `<p><a href="${url}">Passwort zurücksetzen</a> (30 Min. gültig).</p>`,
        );
      } catch (e) {
        this.logger.warn(`Email delivery failed: ${(e as Error).message}`);
      }
    }
    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.findUserByResetToken(token);
    if (!user || !user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    await this.prisma.updateUserScoped(user.id, user.tenantId, {
      password: await bcrypt.hash(newPassword, 10),
      resetToken: null,
      resetTokenExpiry: null,
    });
    return { ok: true };
  }

  private async issueTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
    });
    return { accessToken, refreshToken, user };
  }
}