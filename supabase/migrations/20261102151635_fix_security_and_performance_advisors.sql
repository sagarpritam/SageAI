-- Fix Security and Performance Advisors
-- Migration: 20261102151635_fix_security_and_performance_advisors

-- 1. Enable RLS and add explicit deny policies on all public tables to prevent PostgREST/GraphQL data leakage
DO $$
DECLARE
    tbl text;
    tbls text[] := ARRAY[
        'organizations', 'assets', 'kg_edges', 'kg_nodes',
        'notification_channels', 'users', 'webhooks', 'api_keys',
        'audit_logs', 'scan_schedules', 'scans', 'agent_logs',
        'asm_events', 'attack_surface_diffs', 'findings', 'remediation_patches'
    ];
BEGIN
    FOREACH tbl IN ARRAY tbls LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "deny_all_access" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "deny_all_access" ON public.%I FOR ALL USING (false);', tbl);
    END LOOP;
END $$;

-- 2. Revoke permissions from anon and authenticated roles to satisfy pg_graphql exposure checks
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- 3. Create covering indexes on all unindexed foreign key constraints
CREATE INDEX IF NOT EXISTS ix_agent_logs_scan_id_fk ON public.agent_logs (scan_id);
CREATE INDEX IF NOT EXISTS ix_api_keys_created_by_fk ON public.api_keys (created_by);
CREATE INDEX IF NOT EXISTS ix_api_keys_organization_id_fk ON public.api_keys (organization_id);
CREATE INDEX IF NOT EXISTS ix_asm_events_asset_id_fk ON public.asm_events (asset_id);
CREATE INDEX IF NOT EXISTS ix_asm_events_organization_id_fk ON public.asm_events (organization_id);
CREATE INDEX IF NOT EXISTS ix_asm_events_scan_id_fk ON public.asm_events (scan_id);
CREATE INDEX IF NOT EXISTS ix_attack_surface_diffs_asset_id_fk ON public.attack_surface_diffs (asset_id);
CREATE INDEX IF NOT EXISTS ix_attack_surface_diffs_current_scan_id_fk ON public.attack_surface_diffs (current_scan_id);
CREATE INDEX IF NOT EXISTS ix_attack_surface_diffs_organization_id_fk ON public.attack_surface_diffs (organization_id);
CREATE INDEX IF NOT EXISTS ix_attack_surface_diffs_previous_scan_id_fk ON public.attack_surface_diffs (previous_scan_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_organization_id_fk ON public.audit_logs (organization_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_user_id_fk ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS ix_findings_scan_id_fk ON public.findings (scan_id);
CREATE INDEX IF NOT EXISTS ix_kg_edges_org_id_fk ON public.kg_edges (org_id);
CREATE INDEX IF NOT EXISTS ix_kg_nodes_org_id_fk ON public.kg_nodes (org_id);
CREATE INDEX IF NOT EXISTS ix_remediation_patches_finding_id_fk ON public.remediation_patches (finding_id);
CREATE INDEX IF NOT EXISTS ix_remediation_patches_organization_id_fk ON public.remediation_patches (organization_id);
CREATE INDEX IF NOT EXISTS ix_scan_schedules_created_by_fk ON public.scan_schedules (created_by);
CREATE INDEX IF NOT EXISTS ix_scan_schedules_organization_id_fk ON public.scan_schedules (organization_id);
CREATE INDEX IF NOT EXISTS ix_scans_organization_id_fk ON public.scans (organization_id);
CREATE INDEX IF NOT EXISTS ix_scans_user_id_fk ON public.scans (user_id);
CREATE INDEX IF NOT EXISTS ix_users_organization_id_fk ON public.users (organization_id);
CREATE INDEX IF NOT EXISTS ix_webhooks_organization_id_fk ON public.webhooks (organization_id);

