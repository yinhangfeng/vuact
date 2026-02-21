import type { RefObject } from 'react';

export function createRef<T>(): RefObject<T> {
  const refObject: RefObject<T> = {
    current: null as T,
  };
  return refObject;
}
