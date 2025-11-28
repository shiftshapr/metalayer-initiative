#!/bin/bash
#
# Automated Monitoring Script for Slice 2 Type Safety
# 
# This script can be run:
# - Manually: ./scripts/monitor-slice2-regressions.sh
# - Via cron: Add to crontab for daily/weekly checks
# - Via GitHub Actions: Schedule workflow
#
# Exit codes:
#   0 - No regressions found
#   1 - Regressions found
#   2 - Script error

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRESENCE_DIR="$SCRIPT_DIR/.."
DIAGNOSTIC_SCRIPT="$PRESENCE_DIR/src/scripts/diagnose-slice2-any-types-strict.ts"
LOG_FILE="${LOG_FILE:-/tmp/slice2-monitor-$(date +%Y%m%d-%H%M%S).log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$LOG_FILE"
}

# Check if diagnostic script exists
if [ ! -f "$DIAGNOSTIC_SCRIPT" ]; then
    log_error "Diagnostic script not found: $DIAGNOSTIC_SCRIPT"
    exit 2
fi

# Change to presence directory
cd "$PRESENCE_DIR" || {
    log_error "Failed to change to presence directory: $PRESENCE_DIR"
    exit 2
}

log "Starting Slice 2 type safety monitoring..."
log "Working directory: $(pwd)"
log "Diagnostic script: $DIAGNOSTIC_SCRIPT"
log "Log file: $LOG_FILE"

# Check if tsx is available
if ! command -v tsx &> /dev/null && ! command -v npx &> /dev/null; then
    log_error "Neither tsx nor npx found. Please install Node.js and npm."
    exit 2
fi

# Run diagnostic
log "Running diagnostic script..."
if npx tsx "$DIAGNOSTIC_SCRIPT" >> "$LOG_FILE" 2>&1; then
    log_success "No regressions found! All Slice 2 files are clean."
    
    # Optional: Send success notification (uncomment if you have notification setup)
    # if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    #     curl -X POST "$SLACK_WEBHOOK_URL" \
    #         -H 'Content-Type: application/json' \
    #         -d "{\"text\":\"✅ Slice 2 type safety check passed\"}"
    # fi
    
    exit 0
else
    EXIT_CODE=$?
    log_error "Regressions detected! Found :any annotations in Slice 2 files."
    log "Check log file for details: $LOG_FILE"
    
    # Show summary from log
    echo ""
    echo "=== Summary ==="
    tail -n 20 "$LOG_FILE" | grep -E "(FAILED|any annotations|Detailed matches)" || true
    
    # Optional: Send failure notification (uncomment if you have notification setup)
    # if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    #     curl -X POST "$SLACK_WEBHOOK_URL" \
    #         -H 'Content-Type: application/json' \
    #         -d "{\"text\":\"❌ Slice 2 type safety check failed. Check logs: $LOG_FILE\"}"
    # fi
    
    exit 1
fi






