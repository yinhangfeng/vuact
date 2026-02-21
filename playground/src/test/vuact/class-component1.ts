import { Component, createElement, reactToVue } from 'vuact';

interface Props {
  string1?: string;
  number1?: number;
  renderAaa?: (options: number) => any;
}

export class ClassComponent1 extends Component<Props> {
  test() {
    return 1;
  }

  render() {
    return createElement('div', {}, 'ClassComponent1');
  }
}

export const VClassComponent1 = reactToVue(ClassComponent1);
