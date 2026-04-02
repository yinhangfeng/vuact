# r2v Vue Hooks

Use this when you want to call Vue hooks inside a React component.

## API

```ts
function useVueEffectScope<T, A>(
  fn: (args: Ref<A | undefined>) => T,
  args?: A
): T
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(args: Ref<A \| undefined>) => T` | Scope function. Only executes once. If you need external closure parameters, pass them via `args` — do not directly reference external closure variables. |
| `args` | `A` (optional) | Arguments passed to `fn`. Converted to a `Ref` and passed to `fn`. When `args` changes, the ref value updates. |

**Returns:**

The return value of `fn`.

**Lifecycle:**

- The `EffectScope` is created once when the component first renders
- The scope is stopped when the component unmounts
- If `args` changes, the internal `argsRef.value` is updated (but `fn` is NOT re-executed)

## Basic Example

```tsx
import { useVueEffectScope } from 'vuact';
import { ref } from 'vue';

export default function Example({ defaultCount = 1 }: { defaultCount?: number }) {
  const { count } = useVueEffectScope((args) => {
    const count = ref(args.value);
    return { count };
  }, defaultCount);

  return (
    <div>
      <p>You clicked {count.value} times</p>
      <button onClick={() => count.value++}>Click me</button>
    </div>
  );
}
```

## Using watch with args

```tsx
import { useVueEffectScope } from 'vuact';
import { onScopeDispose, ref, watch } from 'vue';

export default function Counter({ defaultCount = 1 }: { defaultCount?: number }) {
  const { count } = useVueEffectScope((args) => {
    const count = ref(args.value);

    watch(args, (v) => {
      count.value = v; // args changes update count
    });

    onScopeDispose(() => {
      console.log('scope disposed');
    });

    return { count };
  }, defaultCount);

  return (
    <div>
      <p>You clicked {count.value} times</p>
      <button onClick={() => count.value++}>Click me</button>
    </div>
  );
}
```

## Available Vue APIs in Scope

Inside `useVueEffectScope`, you can use most Vue Composition API:

- `ref`, `shallowRef`, `computed`, `watch`, `watchEffect`
- `onScopeDispose` (recommended for cleanup)
- `onBeforeUnmount` (works but prefer `onScopeDispose`)
- `customRef`, `triggerRef`, `readonly`, `toRaw`

**Cannot use:**

- `getCurrentInstance` (not available in React component context)
- Component-related APIs that require a Vue component instance

## Key Differences from React Hooks

| Aspect | React Hooks | useVueEffectScope |
|--------|-------------|-------------------|
| Re-execution | Re-runs on deps change | `fn` runs only once |
| Cleanup | `useEffect` return | `onScopeDispose` |
| External values | Via deps array | Via `args` parameter |
| Scope lifetime | Per hook call | Tied to component unmount |
