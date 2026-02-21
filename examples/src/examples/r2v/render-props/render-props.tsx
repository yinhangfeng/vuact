import { useState } from 'react';

export default function Counter({
  title,
  renderTitle,
  children,
}: {
  title?: any;
  renderTitle?: (count: number) => any;
  children?: any;
}) {
  const [count, setCount] = useState(0);

  return (
    <div style={{ marginBottom: 20, border: '1px solid #ddd' }}>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      {title}
      {renderTitle?.(count)}
      {typeof children === 'function' ? children(count) : children}
    </div>
  );
}
