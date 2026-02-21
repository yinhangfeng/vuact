import type React from 'react';
import { REACT_FRAGMENT_TYPE } from './symbols';

function Fragment(props: any) {
  return props.children;
}

Fragment.$$typeof = REACT_FRAGMENT_TYPE;

const ReactFragment = Fragment as typeof React.Fragment;

export { ReactFragment as Fragment };
