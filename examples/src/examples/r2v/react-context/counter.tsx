import { createContext, useContext } from 'react';

export const CounterContext = createContext({
  count: 0,
  setCount: (count: number) => {},
});

export default function Counter() {
  // 获取 vue 组件传递过来的 context
  const { count, setCount } = useContext(CounterContext);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
