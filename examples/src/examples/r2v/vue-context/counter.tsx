import { inject } from 'vue';
import { counterInjectionKey } from './context';

export default function Counter() {
  // react 组件内可以直接调用 vue 的 inject 获取 vue context
  const context = inject(counterInjectionKey)!;
  return (
    <div>
      <p>You clicked {context.count.value} times</p>
      <button onClick={() => context.setCount(context.count.value + 1)}>
        Click me
      </button>
    </div>
  );
}
