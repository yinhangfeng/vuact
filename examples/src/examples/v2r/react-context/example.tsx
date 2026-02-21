/**
 * React 向 Vue 组件传递 React context
 */
import { v2r } from 'vuact';
import { useState } from 'react';
import Counter from './counter.vue';
import { CounterContext } from './context';

const RCounter = v2r(Counter);

export default function Example() {
  const [context, setContext] = useState({
    count: 1,
    setCount,
  });
  function setCount(count: number) {
    setContext({
      ...context,
      count,
    });
  }

  return (
    <CounterContext.Provider value={context}>
      <RCounter defaultCount={1} />
    </CounterContext.Provider>
  );
}
