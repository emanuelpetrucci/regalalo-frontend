#!/bin/bash
# ci-local.sh — Mirror CI environment locally for debugging
# Usage:
#   ./scripts/ci-local.sh               # Run default PR suite (chromium)
#   ./scripts/ci-local.sh --nightly     # Run nightly suite (all browsers)
#   ./scripts/ci-local.sh --shard 1/2  # Run specific shard

set -euo pipefail

NIGHTLY=false
SHARD=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --nightly) NIGHTLY=true; shift ;;
    --shard) SHARD="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

echo "🔧 Mirroring CI environment locally..."

# Install deps (same as CI)
npm ci

# Install Playwright browsers
if [ "$NIGHTLY" = true ]; then
  npx playwright install --with-deps
else
  npx playwright install --with-deps chromium
fi

# Run tests
if [ -n "$SHARD" ]; then
  echo "▶ Running shard $SHARD"
  SHARD_ARGS="--shard=$SHARD"
else
  SHARD_ARGS=""
fi

if [ "$NIGHTLY" = true ]; then
  echo "▶ Nightly: all browsers, all tests"
  # shellcheck disable=SC2086
  npm run test:e2e:ci:nightly -- $SHARD_ARGS
else
  echo "▶ PR: chromium only"
  # shellcheck disable=SC2086
  npm run test:e2e:ci -- $SHARD_ARGS
fi
