# r2v Vue Hooks

适用于在 React 组件内部调用 Vue hooks。

```tsx
import { useVueEffectScope } from 'vuact';
import { onScopeDispose, ref, watch } from 'vue';

export default function Example({ defaultCount = 1 }: { defaultCount?: number }) {
  const { count } = useVueEffectScope((args) => {
    const count = ref(args.value);
    watch(args, (v) => {
      count.value = v;
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
