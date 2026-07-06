import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly base = new PrismaClient();
  readonly client = this.buildTenantClient();

  constructor(private readonly cls: ClsService) {}

  private buildTenantClient() {
    const base = this.base;
    const cls = this.cls;
    return base.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const tenantId = cls.get<string>('tenantId');
            if (!tenantId) {
              return query(args);
            }
            const [, result] = await base.$transaction([
              base.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    });
  }

  /** البحث عن participant بالإيميل عبر كل التينانتات (بدون RLS) */
  async findParticipantByContact(contact: string): Promise<any | null> {
    const [, rows] = await this.base.$transaction([
      this.base.$executeRaw`SELECT set_config('app.auth_bypass', 'on', TRUE)`,
      this.base.$queryRaw<any[]>`
        SELECT * FROM "Participant"
        WHERE LOWER(contact) = LOWER(${contact})
        LIMIT 1
      `,
    ]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }

  /** Look up a user across tenants for login (RLS bypass for the User table only). */
  async findUserForAuth(identifier: string) {
    if (!identifier) return null;
    const [, user] = await this.base.$transaction([
      this.base.$executeRaw`SELECT set_config('app.auth_bypass', 'on', TRUE)`,
      this.base.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } }),
    ]);
    return user;
  }

  async findUserByResetToken(token: string) {
    if (!token) return null;
    const [, user] = await this.base.$transaction([
      this.base.$executeRaw`SELECT set_config('app.auth_bypass', 'on', TRUE)`,
      this.base.user.findFirst({ where: { resetToken: token } }),
    ]);
    return user;
  }

  /** Run statements under a chosen tenant context (used by public self-registration). */
  async runAsTenant<T>(tenantId: string, fn: (tx: any) => Promise<T>): Promise<T> {
    return this.base.$transaction(async (tx: any) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, TRUE)`;
      return fn(tx);
    });
  }

  async createTenantWithAdmin(input: {
    orgName: string;
    admin: { name: string; email: string; username?: string; password: string };
  }) {
    return this.base.$transaction(async (tx: any) => {
      await tx.$executeRaw`SELECT set_config('app.auth_bypass', 'on', TRUE)`;
      const tenant = await tx.tenant.create({ data: { name: input.orgName } });
      const user = await tx.user.create({
        data: {
          email: input.admin.email,
          username: input.admin.username,
          password: input.admin.password,
          role: 'admin',
          name: input.admin.name,
          tenantId: tenant.id,
        },
      });
      return user;
    });
  }

  async updateUserScoped(userId: string, tenantId: string, data: any) {
    const [, user] = await this.base.$transaction([
      this.base.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, TRUE)`,
      this.base.user.update({ where: { id: userId }, data }),
    ]);
    return user;
  }

  async findUserById(id: string) {
    const [, user] = await this.base.$transaction([
      this.base.$executeRaw`SELECT set_config('app.auth_bypass', 'on', TRUE)`,
      this.base.user.findUnique({ where: { id } }),
    ]);
    return user;
  }

  async withTenant<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    const tenantId = this.cls.get<string>('tenantId');
    return this.base.$transaction(async (tx: any) => {
      if (tenantId) {
        await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, TRUE)`;
      }
      return fn(tx);
    });
  }

  async onModuleInit() {
    await this.base.$connect();
  }

  async onModuleDestroy() {
    await this.base.$disconnect();
  }
}