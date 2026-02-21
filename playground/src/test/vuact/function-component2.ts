import type { FunctionComponent } from 'react';
import { createElement, reactToVue } from 'vuact';

interface Props {
  string1?: string;
  number1?: number;
}

export const FunctionComponent2: FunctionComponent<Props> = (props) => {
  return createElement('FunctionComponent2', {}, 'Comp1');
};

export const VFunctionComponent2 = reactToVue(FunctionComponent2);
