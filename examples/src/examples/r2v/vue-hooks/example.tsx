/**
 * React 组件使用 vue hooks
 */
import { useVueEffectScope } from 'vuact';
import { onScopeDispose, ref, watch } from 'vue';

export default function Example({
  defaultCount = 1,
}: {
  defaultCount?: number;
}) {
  // 通过 useVueEffectScope 执行 vue hooks
  const { count } = useVueEffectScope((args) => {
    const count = ref(args.value);
    watch(args, (v) => {
      count.value = v;
    });

    onScopeDispose(() => {
      console.log('scope disposed');
    });
    return {
      count,
    };
  }, defaultCount);
  return (
    <div>
      <p>You clicked {count.value} times</p>
      <button onClick={() => count.value++}>Click me</button>
    </div>
  );
}
