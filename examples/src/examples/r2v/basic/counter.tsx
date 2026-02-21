import { useState } from 'react';
export default function Counter({
  defaultCount = 0,
  className,
  style,
}: {
  defaultCount?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [count, setCount] = useState(defaultCount);
  return (
    <div className={className} style={style}>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
