-- SageAI Full Schema Migration
-- Migration: 20261026120303_create_sageai_full_schema

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assettype') THEN
        CREATE TYPE assettype AS ENUM ('domain', 'subdomain', 'ip', 'server', 'api', 'cloud_resource');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assetstatus') THEN
        CREATE TYPE assetstatus AS ENUM ('active', 'stale', 'unknown');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asmeventtype') THEN
        CREATE TYPE asmeventtype AS ENUM ('new_subdomain', 'new_ip', 'new_port', 'new_service', 'port_closed', 'service_changed', 'dns_changed', 'new_vulnerability');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asmeventseverity') THEN
        CREATE TYPE asmeventseverity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'findingseverity') THEN
        CREATE TYPE findingseverity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'findingstatus') THEN
        CREATE TYPE findingstatus AS ENUM ('new', 'confirmed', 'in_progress', 'fixed', 'accepted_risk', 'reopened');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patchstatus') THEN
        CREATE TYPE patchstatus AS ENUM ('proposed', 'approved', 'rejected', 'applied', 'failed');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR NOT NULL, 
    name VARCHAR NOT NULL, 
    plan VARCHAR NOT NULL, 
    github_token_encrypted VARCHAR, 
    require_verified_domains BOOLEAN NOT NULL, 
    ci_fail_on_critical BOOLEAN NOT NULL, 
    ci_fail_on_high BOOLEAN NOT NULL, 
    ci_auto_remediate BOOLEAN NOT NULL, 
    stripe_customer_id VARCHAR, 
    stripe_subscription_id VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (stripe_customer_id), 
    UNIQUE (stripe_subscription_id)
);

CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    asset_type assettype NOT NULL, 
    value VARCHAR NOT NULL, 
    ip_address VARCHAR, 
    open_ports TEXT NOT NULL, 
    technologies TEXT NOT NULL, 
    dns_records TEXT NOT NULL, 
    ssl_info TEXT NOT NULL, 
    http_status INTEGER, 
    http_title VARCHAR, 
    risk_score FLOAT NOT NULL, 
    risk_level VARCHAR NOT NULL, 
    risk_summary TEXT NOT NULL, 
    shodan_data TEXT NOT NULL, 
    virustotal_data TEXT NOT NULL, 
    status assetstatus NOT NULL, 
    first_seen TIMESTAMP WITH TIME ZONE NOT NULL, 
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL, 
    last_scanned TIMESTAMP WITH TIME ZONE, 
    discovered_in_scan VARCHAR, 
    is_verified BOOLEAN NOT NULL, 
    verification_token VARCHAR, 
    verification_method VARCHAR, 
    verified_at TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT uq_org_asset_value UNIQUE (organization_id, value), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kg_edges (
    id VARCHAR NOT NULL, 
    org_id VARCHAR NOT NULL, 
    source_id VARCHAR NOT NULL, 
    target_id VARCHAR NOT NULL, 
    edge_type VARCHAR NOT NULL, 
    weight FLOAT, 
    properties TEXT NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(org_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kg_nodes (
    id VARCHAR NOT NULL, 
    org_id VARCHAR NOT NULL, 
    node_type VARCHAR NOT NULL, 
    label VARCHAR NOT NULL, 
    properties TEXT NOT NULL, 
    risk_score FLOAT, 
    created_at TIMESTAMP WITH TIME ZONE, 
    updated_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(org_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_channels (
    id VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    name VARCHAR(100) NOT NULL, 
    channel_type VARCHAR(50) NOT NULL, 
    webhook_url VARCHAR(1000) NOT NULL, 
    min_severity VARCHAR(20) NOT NULL, 
    is_active BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT uq_org_notification_name UNIQUE (organization_id, name), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR NOT NULL, 
    email VARCHAR NOT NULL, 
    password_hash VARCHAR NOT NULL, 
    role VARCHAR NOT NULL, 
    mfa_secret VARCHAR, 
    mfa_enabled BOOLEAN NOT NULL, 
    mfa_backup_codes VARCHAR, 
    organization_id VARCHAR NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webhooks (
    id VARCHAR NOT NULL, 
    url VARCHAR NOT NULL, 
    event VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    secret VARCHAR NOT NULL, 
    is_active BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR NOT NULL, 
    key VARCHAR NOT NULL, 
    name VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    created_by VARCHAR NOT NULL, 
    is_active BOOLEAN NOT NULL, 
    last_used_at TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
    FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    action VARCHAR NOT NULL, 
    resource_type VARCHAR NOT NULL, 
    resource_id VARCHAR, 
    details TEXT, 
    ip_address VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS scan_schedules (
    id VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    created_by VARCHAR NOT NULL, 
    target VARCHAR NOT NULL, 
    frequency VARCHAR NOT NULL, 
    is_active BOOLEAN, 
    last_run_at TIMESTAMP WITH TIME ZONE, 
    next_run_at TIMESTAMP WITH TIME ZONE, 
    run_count INTEGER, 
    created_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
    FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scans (
    id VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    target VARCHAR NOT NULL, 
    scan_type VARCHAR NOT NULL, 
    findings TEXT NOT NULL, 
    risk_score INTEGER NOT NULL, 
    risk_level VARCHAR NOT NULL, 
    status VARCHAR NOT NULL, 
    stage VARCHAR, 
    progress INTEGER NOT NULL, 
    retry_count INTEGER NOT NULL, 
    idempotency_key VARCHAR, 
    celery_task_id VARCHAR, 
    share_token VARCHAR, 
    is_authorized BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    UNIQUE (share_token)
);

CREATE TABLE IF NOT EXISTS agent_logs (
    id VARCHAR NOT NULL, 
    scan_id VARCHAR NOT NULL, 
    agent_name VARCHAR NOT NULL, 
    action_text VARCHAR NOT NULL, 
    details TEXT, 
    timestamp TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(scan_id) REFERENCES scans (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asm_events (
    id VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    asset_id VARCHAR, 
    scan_id VARCHAR, 
    event_type asmeventtype NOT NULL, 
    severity asmeventseverity NOT NULL, 
    title VARCHAR NOT NULL, 
    description TEXT, 
    details TEXT NOT NULL, 
    is_alert_sent BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
    FOREIGN KEY(asset_id) REFERENCES assets (id) ON DELETE CASCADE, 
    FOREIGN KEY(scan_id) REFERENCES scans (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attack_surface_diffs (
    id VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    asset_id VARCHAR, 
    previous_scan_id VARCHAR, 
    current_scan_id VARCHAR NOT NULL, 
    ports_diff TEXT, 
    vulnerabilities_diff TEXT, 
    subdomains_diff TEXT, 
    technologies_diff TEXT, 
    overall_risk_shift VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
    FOREIGN KEY(asset_id) REFERENCES assets (id) ON DELETE CASCADE, 
    FOREIGN KEY(previous_scan_id) REFERENCES scans (id) ON DELETE SET NULL, 
    FOREIGN KEY(current_scan_id) REFERENCES scans (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR NOT NULL, 
    scan_id VARCHAR NOT NULL, 
    title VARCHAR NOT NULL, 
    description TEXT NOT NULL, 
    severity findingseverity NOT NULL, 
    cvss_score FLOAT, 
    status findingstatus NOT NULL, 
    assigned_to VARCHAR, 
    resolved_at TIMESTAMP WITH TIME ZONE, 
    notes TEXT, 
    asset_identified VARCHAR, 
    remediation_steps TEXT, 
    evidence TEXT, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(scan_id) REFERENCES scans (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS remediation_patches (
    id VARCHAR NOT NULL, 
    organization_id VARCHAR NOT NULL, 
    finding_id VARCHAR, 
    repository VARCHAR NOT NULL, 
    base_branch VARCHAR NOT NULL, 
    patch_branch VARCHAR NOT NULL, 
    file_path VARCHAR NOT NULL, 
    vulnerability_type VARCHAR NOT NULL, 
    severity VARCHAR NOT NULL, 
    original_code TEXT NOT NULL, 
    patched_code TEXT NOT NULL, 
    diff TEXT NOT NULL, 
    lines_changed INTEGER NOT NULL, 
    status patchstatus NOT NULL, 
    sandbox_passed BOOLEAN NOT NULL, 
    sandbox_details TEXT NOT NULL, 
    requested_by VARCHAR NOT NULL, 
    approved_by VARCHAR, 
    approved_at TIMESTAMP WITH TIME ZONE, 
    rejection_reason TEXT, 
    pr_number INTEGER, 
    pr_url VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(organization_id) REFERENCES organizations (id) ON DELETE CASCADE, 
    FOREIGN KEY(finding_id) REFERENCES findings (id) ON DELETE SET NULL
);

