#!/bin/bash
#
# Nightly database backup for Prevsol Digital.
#
#   chmod +x deploy/backup.sh
#   crontab -e
#   0 3 * * * /home/prevsol/app/web/deploy/backup.sh >> /home/prevsol/backup.log 2>&1
#
# These are financial records. Getting a copy OFF this machine is the part that
# actually protects you — see the rclone section at the bottom.

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/home/prevsol/backups}"
DB_NAME="${DB_NAME:-prevsol}"
DB_USER="${DB_USER:-prevsol}"
KEEP_DAYS="${KEEP_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

STAMP=$(date +%Y%m%d-%H%M%S)
TARGET="$BACKUP_DIR/prevsol-$STAMP.sql.gz"

echo "[$(date -Is)] backing up $DB_NAME → $TARGET"

# --clean --if-exists makes the dump safe to restore over an existing database.
pg_dump --username="$DB_USER" --clean --if-exists "$DB_NAME" | gzip > "$TARGET"

# A dump that is suspiciously small usually means pg_dump failed mid-write.
SIZE=$(stat -c%s "$TARGET")
if [ "$SIZE" -lt 1024 ]; then
	echo "[$(date -Is)] ERROR: backup is only ${SIZE} bytes — treating as failed"
	rm -f "$TARGET"
	exit 1
fi

echo "[$(date -Is)] wrote $(numfmt --to=iec "$SIZE")"

# Prune old local copies.
find "$BACKUP_DIR" -name 'prevsol-*.sql.gz' -mtime "+$KEEP_DAYS" -delete
echo "[$(date -Is)] pruned backups older than $KEEP_DAYS days"

# --- Off-site copy ---------------------------------------------------------
# STRONGLY RECOMMENDED. A backup on this server does not survive losing this
# server. Install rclone, run `rclone config` once, then uncomment:
#
# rclone copy "$TARGET" remote:prevsol-backups --log-level INFO
#
# Any S3-compatible store works — Backblaze B2, Cloudflare R2, Wasabi.

echo "[$(date -Is)] done"

# --- Restoring -------------------------------------------------------------
# Test this at least once, before you ever need it:
#
#   createdb -U prevsol prevsol_restore_test
#   gunzip -c /home/prevsol/backups/prevsol-YYYYMMDD-HHMMSS.sql.gz \
#     | psql -U prevsol prevsol_restore_test
#
# A backup you have never restored is a hope, not a backup.
