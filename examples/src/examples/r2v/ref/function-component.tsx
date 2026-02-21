import {
  forwardRef,
  useImperativeHandle,
  useState,
  type ForwardedRef,
} from 'react';

export default forwardRef(
  (
    _props,
    ref: ForwardedRef<{
      incCount: () => void;
    }>
  ) => {
    const [count, setCount] = useState(0);

    useImperativeHandle(ref, () => ({
      incCount: () => {
        setCount(count + 1);
      },
    }));
    return (
      <div>
        <p>count {count}</p>
      </div>
    );
  }
);
