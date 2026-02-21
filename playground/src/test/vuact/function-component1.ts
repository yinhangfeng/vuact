import { createElement, reactToVue } from 'vuact';

interface Props {
  string1?: string;
  number1?: number;
  renderAaa?: (options: number, aaa: string) => any;
}

export function FunctionComponent1(props: Props) {
  return createElement('FunctionComponent1', {}, 'Comp1');
}

export const VFunctionComponent1 = reactToVue(FunctionComponent1);
