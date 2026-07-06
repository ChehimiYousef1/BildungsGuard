-- Row-Level Security policies. Paste this into the migration created by:
--   npx prisma migrate dev --create-only --name rls
-- then apply with: npx prisma migrate dev

-- Tenant-scoped tables: a row is visible only when its tenantId matches the
-- per-request session variable app.current_tenant (set by the app on every query).
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'Participant','Measure','Trainer','Course','Session','Attendance',
    'Document','Capa','AuditRecord','AuditLog','Alumni','Campaign','Channel','Automation'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE  ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I '
      'USING ("tenantId" = current_setting(''app.current_tenant'', true)) '
      'WITH CHECK ("tenantId" = current_setting(''app.current_tenant'', true));', t);
  END LOOP;
END $$;

-- User: same isolation, but the login lookup (no tenant yet) may bypass via app.auth_bypass.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "User";
CREATE POLICY tenant_isolation ON "User"
  USING ("tenantId" = current_setting('app.current_tenant', true)
         OR current_setting('app.auth_bypass', true) = 'on')
  WITH CHECK ("tenantId" = current_setting('app.current_tenant', true));

-- Tenant: each tenant sees only its own row (auth bypass covers the login lookup).
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_self ON "Tenant";
CREATE POLICY tenant_self ON "Tenant"
  USING ("id" = current_setting('app.current_tenant', true)
         OR current_setting('app.auth_bypass', true) = 'on')
  WITH CHECK ("id" = current_setting('app.current_tenant', true));
