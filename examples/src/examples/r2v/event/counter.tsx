import { useState } from 'react';
export default function Counter({
  count,
  onUpdateCount,
}: {
  count?: number;
  onUpdateCount?: (count: number) => void;
}) {
  const [_count, setCount] = useState(0);
  const finalCount = count ?? _count;

  function onIncrement() {
    setCount(finalCount + 1);
    onUpdateCount?.(finalCount + 1);
  }
  return (
    <div>
      <p>You clicked {finalCount} times</p>
      <button onClick={onIncrement}>Click me</button>
    </div>
  );
}
