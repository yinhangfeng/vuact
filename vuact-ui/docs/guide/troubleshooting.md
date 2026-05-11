# Troubleshooting

## Common Issues

### 1. Double React Instance

**Symptom**: Components render twice or behave unexpectedly.

**Cause**: `react` not excluded from `optimizeDeps`.

**Solution**:

```ts
export default defineConfig({
  optimizeDeps: {
    exclude: ['react', 'react-dom', 'react/jsx-runtime'],
  },
});
```

### 2. SSR Not Supported

**Symptom**: Errors during server-side rendering.

**Cause**: vuact does not support SSR in the first version.

**Solution**: Use `ClientOnly` wrapper or disable SSR for vuact components.

### 3. CJS Import Issues

**Symptom**: `Cannot find module` errors for sub-packages like `antd/es/Button`.

**Cause**: Mixed ESM/CJS resolution.

**Solution**: Ensure your bundler handles both module formats correctly.

### 4. Form/Table Experimental

**Symptom**: Form behavior differs from React or Vue versions.

**Cause**: Complex components like Form and Table are marked experimental.

**Solution**: Check the adapter package's README for known differences.

### 5. Missing Styles

**Symptom**: Components render without styles.

**Cause**: Need to import target library's CSS.

**Solution**:

```ts
import 'antd/dist/reset.css';
```

## Getting Help

- Check the [GitHub Issues](https://github.com/yinhangfeng/vuact/issues)
- Ask in the [Discord Community](https://discord.gg/vuact)
