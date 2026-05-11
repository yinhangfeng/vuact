#!/bin/bash

LIB_NAME=$1

if [ -z "$LIB_NAME" ]; then
  echo "Usage: ./test.sh <lib-name>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR"

echo "Running tests for @vuact/$LIB_NAME..."

pnpm --filter "@vuact/$LIB_NAME" test
