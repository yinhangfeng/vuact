import type { Ref } from 'react';
import {
  createElement,
  reactToVue,
  forwardRef,
  useImperativeHandle,
} from 'vuact';

interface Props {
  string1?: string;
  number1?: number;
  renderAaa?: (options: { aaa: string }) => number;
  renderBbb?: (options: string) => number;
}

interface Instance {
  isInstance?: boolean;
  string1?: string;
  number1?: number;
}

export const FunctionComponent3 = forwardRef(
  (props: Props, ref: Ref<Instance>) => {
    useImperativeHandle(ref, () => {
      return {};
    });

    return createElement('FunctionComponent3', {}, 'Comp1');
  }
);

export const VFunctionComponent3 = reactToVue(FunctionComponent3);
