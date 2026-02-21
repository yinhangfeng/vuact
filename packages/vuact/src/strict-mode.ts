import type React from 'react';
import { REACT_STRICT_MODE_TYPE } from './symbols';

function StrictMode(props: any) {
  return props.children;
}

StrictMode.$$typeof = REACT_STRICT_MODE_TYPE;

const ReactStrictMode = StrictMode as typeof React.StrictMode;

export { ReactStrictMode as StrictMode };
