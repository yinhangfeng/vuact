/**
 * Vue React 混合使用
 * 当前文件扩展名为 .vue.tsx 所以会被 vueJsx 插件处理，jsx 被编译为 vue vnode
 * 但当前又是一个 React 组件，可以使用 React hooks
 * 通过 useVueEffectScope 又能使用 vue hooks
 */
import { useVueEffectScope } from 'vuact';
import { useState } from 'react';
import { onScopeDispose, ref, watch } from 'vue';

export default function Counter({
  defaultCount = 0,
}: {
  defaultCount?: number;
}) {
  const [count1, setCount] = useState(defaultCount);

  const { count: count2 } = useVueEffectScope((args) => {
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
      <p>
        count1: {count1} count2: {count2.value}
      </p>
      <button onClick={() => setCount(count1 + 1)}>count1</button>
      <button onClick={() => count2.value++}>count2</button>
    </div>
  );
}
