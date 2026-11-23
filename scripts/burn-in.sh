#!/bin/bash
# burn-in.sh — Local flaky test detection
# Usage:
#   ./scripts/burn-in.sh              # 10 iterations (default)
#   ./scripts/burn-in.sh --count 5   # Custom iteration count

set -euo pipefail

COUNT=10

while [[ $# -gt 0 ]]; do
  case "$1" in
    --count) COUNT="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

echo "🔥 Starting burn-in: $COUNT iterations"
echo "   Suite: chromium E2E (active tests only)"
echo ""

for i in $(seq 1 "$COUNT"); do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔥 Iteration $i/$COUNT"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  npm run test:e2e:ci || {
    echo ""
    echo "❌ FLAKY TEST DETECTED at iteration $i"
    echo "   Check playwright-report/ for details"
    exit 1
  }
done

echo ""
echo "✅ Burn-in complete — $COUNT iterations passed"
echo "   No flaky tests detected"
