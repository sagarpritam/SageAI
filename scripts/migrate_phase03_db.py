import os
import sqlite3

db_path = "sageai.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cols = [
        ("scan_type", "TEXT DEFAULT 'full' NOT NULL"),
        ("stage", "TEXT DEFAULT 'init'"),
        ("progress", "INTEGER DEFAULT 0 NOT NULL"),
        ("retry_count", "INTEGER DEFAULT 0 NOT NULL"),
        ("idempotency_key", "TEXT"),
        ("celery_task_id", "TEXT"),
        ("is_authorized", "INTEGER DEFAULT 0 NOT NULL"),
    ]
    existing = [col[1] for col in cursor.execute("PRAGMA table_info(scans)").fetchall()]
    for col_name, col_def in cols:
        if col_name not in existing:
            cursor.execute(f"ALTER TABLE scans ADD COLUMN {col_name} {col_def}")
            print(f"Added {col_name}")
    conn.commit()
    conn.close()
    print("Migration complete")
else:
    print("sageai.db does not exist")
