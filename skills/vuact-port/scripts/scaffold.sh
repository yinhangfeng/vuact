#!/bin/bash

LIB_NAME=$1

if [ -z "$LIB_NAME" ]; then
  echo "Usage: ./scaffold.sh <lib-name>"
  exit 1
fi

PKG_DIR="packages/$LIB_NAME"

if [ -d "$PKG_DIR" ]; then
  echo "Package $PKG_DIR already exists"
  exit 1
fi

mkdir -p "$PKG_DIR/src/components"
mkdir -p "$PKG_DIR/src/overrides"
mkdir -p "$PKG_DIR/tests/parity"
mkdir -p "$PKG_DIR/tests/visual"
mkdir -p "$PKG_DIR/playground"
mkdir -p "$PKG_DIR/.vuact-port"

cat > "$PKG_DIR/package.json" <<'EOF'
{
  "name": "@vuact/LIB_NAME",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": {
      "import": "./src/index.ts"
    }
  },
  "peerDependencies": {
    "vue": "^3.5.0",
    "vuact": "^0.1.0",
    "vuact-dom": "^0.1.0",
    "LIB_NAME": "workspace:*"
  }
}
EOF

cat > "$PKG_DIR/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx"
  }
}
EOF

cat > "$PKG_DIR/src/hints.ts" <<'EOF'
import { defineHints } from '../../tools/codegen/src/dsl';

export default defineHints({});
EOF

cat > "$PKG_DIR/src/index.ts" <<'EOF'
export * from './components';
EOF

cat > "$PKG_DIR/README.md" <<'EOF'
# @vuact/LIB_NAME

Vue 3 adapter for LIB_NAME, built on vuact.

## Compatibility

- Vue: ^3.5.0
- vuact: ^0.1.0
- LIB_NAME: (see package.json peerDependencies)

## Known Differences

(TODO: document known differences)

## Unsupported Components

(TODO: list unsupported components)
EOF

echo "Scaffold created at $PKG_DIR"
