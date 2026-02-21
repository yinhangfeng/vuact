/**
 * React 向 Vue 组件传递 Vue context
 */
import { v2r, VueContextProvider } from 'vuact';
import { useMemo } from 'react';
import { shallowRef } from 'vue';
import Counter from './counter.vue';
import { type CounterContext, counterInjectionKey } from './context';

const RCounter = v2r(Counter);

export default function Example() {
  const counterContext = useMemo(() => {
    const count = shallowRef(1);
    return {
      count,
      setCount: (c) => {
        count.value = c;
      },
    } as CounterContext;
  }, []);

  return (
    // 按 Vue 规范，Vue context 不能改变，所以 VueContextProvider 的 value 不允许改变
    <VueContextProvider contextKey={counterInjectionKey} value={counterContext}>
      <RCounter defaultCount={1} />
    </VueContextProvider>
  );
}
