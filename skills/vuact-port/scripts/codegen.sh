#!/bin/bash

LIB_NAME=$1

if [ -z "$LIB_NAME" ]; then
  echo "Usage: ./codegen.sh <lib-name>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR"

echo "Running codegen for $LIB_NAME..."

pnpm --filter vuact-codegen run build 2>/dev/null || echo "Build skipped"

pnpm exec vuact-codegen \
  --source "$LIB_NAME" \
  --entry "node_modules/$LIB_NAME/es/index.d.ts" \
  --hints "packages/$LIB_NAME/src/hints.ts" \
  --out "packages/$LIB_NAME/src/components"
