"""Phase 04 Database Migration Script — SagePatch Remediation Engine.

Creates `remediation_patches` table with indexes for SQLite databases.
"""

import os
import sqlite3

db_files = ["sageai.db", "test_sageai.db"]

create_table_sql = """
CREATE TABLE IF NOT EXISTS remediation_patches (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    finding_id TEXT REFERENCES findings(id) ON DELETE SET NULL,
    repository TEXT NOT NULL,
    base_branch TEXT NOT NULL DEFAULT 'main',
    patch_branch TEXT NOT NULL,
    file_path TEXT NOT NULL,
    vulnerability_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM',
    original_code TEXT NOT NULL,
    patched_code TEXT NOT NULL,
    diff TEXT NOT NULL,
    lines_changed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'proposed',
    sandbox_passed INTEGER NOT NULL DEFAULT 0,
    sandbox_details TEXT DEFAULT '{}',
    requested_by TEXT NOT NULL,
    approved_by TEXT,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    pr_number INTEGER,
    pr_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

create_indexes_sql = [
    "CREATE INDEX IF NOT EXISTS ix_patch_org_status ON remediation_patches (organization_id, status);",
    "CREATE INDEX IF NOT EXISTS ix_patch_repo_branch ON remediation_patches (repository, patch_branch);",
    "CREATE INDEX IF NOT EXISTS ix_patch_finding_id ON remediation_patches (finding_id);",
]

for db_path in db_files:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(create_table_sql)
        for idx in create_indexes_sql:
            cursor.execute(idx)
        conn.commit()
        conn.close()
        print(f"Migrated Phase 04 schema for {db_path}")
    else:
        print(f"Skipping {db_path} (does not exist)")

print("Phase 04 database migration complete.")
