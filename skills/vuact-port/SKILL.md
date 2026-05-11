---
name: vuact-port
description: >
  AI skill for porting React UI libraries to Vue via vuact. This skill automates
  the end-to-end process of creating a new `@vuact/<lib>` adapter package, including
  scaffolding, codegen, AI review, demo generation, testing, and PR creation.

  **AI Agent Trigger Conditions:**
  - User wants to add a new React UI library to vuact-ui
  - User says "port X to vuact" or "add @vuact/X adapter"
  - User wants to create a new vuact adapter package
  - User asks about generating vuact wrappers for antd, MUI, Arco, Semi, etc.
---

# vuact-port

This skill automates the creation of vuact adapter packages for React UI libraries.

## Environment Contract

- Current working directory is the `vuact-ui` monorepo root
- `vuact` package is available via npm/pnpm
- `vuact-codegen` is available (built from `tools/codegen/`)
- Target React UI library is installed in node_modules

## End-to-End Workflow

```
用户：把 antd 接入 vuact-ui

│
├─ Step 1  脚手架
│   exec: ./skills/vuact-port/scripts/scaffold.sh <lib-name>
│         创建 packages/<lib>/ 空包骨架
│
├─ Step 2  安装目标库
│   exec: pnpm -F @vuact/<lib> add -D <target-lib>
│
├─ Step 3  Codegen
│   exec: vuact-codegen --source <lib> --entry node_modules/<lib>/es/index.d.ts --hints src/hints.ts --out src/components
│
├─ Step 4  AI 审阅（核心价值）
│   AI 读取 codegen 产物 + meta.json + hints.ts + 目标库文档
│   按 prompts/ai-review-rules.md 修正 needsManualReview 组件
│   在 overrides/ 写人工版本
│   更新 hints.ts 让下次 codegen 一致
│
├─ Step 5  生成 Demo
│   AI 在 playground/ 写几个典型组件的 Vue demo
│
├─ Step 6  跑测试
│   exec: pnpm -F @vuact/<lib> test
│   失败时回 Step 4
│
└─ Step 7  提 PR
    AI 写 changeset、commit、推 PR
```

## Fixed Scripts

### scaffold.sh

```bash
#!/bin/bash
LIB_NAME=$1
PKG_DIR="packages/$LIB_NAME"

mkdir -p "$PKG_DIR/src/components"
mkdir -p "$PKG_DIR/src/overrides"
mkdir -p "$PKG_DIR/tests/parity"
mkdir -p "$PKG_DIR/tests/visual"
mkdir -p "$PKG_DIR/playground"
mkdir -p "$PKG_DIR/.vuact-port"

cat > "$PKG_DIR/package.json" <<EOF
{
  "name": "@vuact/$LIB_NAME",
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
    "$LIB_NAME": "workspace:*"
  }
}
EOF

cat > "$PKG_DIR/tsconfig.json" <<EOF
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

cat > "$PKG_DIR/README.md" <<EOF
# @vuact/$LIB_NAME

Vue 3 adapter for $LIB_NAME, built on vuact.

## Compatibility

- Vue: ^3.5.0
- vuact: ^0.1.0
- $LIB_NAME: (see package.json peerDependencies)

## Known Differences

(TODO: document known differences)

## Unsupported Components

(TODO: list unsupported components)
EOF

echo "Scaffold created at $PKG_DIR"
```

### install-target.sh

```bash
#!/bin/bash
LIB_NAME=$1
TARGET_LIB=$2

cd packages/$LIB_NAME
pnpm add -D $TARGET_LIB
cd ../..
```

### codegen.sh

```bash
#!/bin/bash
LIB_NAME=$1

vuact-codegen \
  --source $LIB_NAME \
  --entry node_modules/$LIB_NAME/es/index.d.ts \
  --hints packages/$LIB_NAME/src/hints.ts \
  --out packages/$LIB_NAME/src/components
```

## AI Review Prompts

See `prompts/ai-review-rules.md` for detailed review rules.
