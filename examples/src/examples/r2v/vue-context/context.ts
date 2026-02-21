import { type InjectionKey, type Ref } from 'vue';

export interface CounterContext {
  count: Ref<number>;
  setCount: (count: number) => void;
}

export const counterInjectionKey: InjectionKey<CounterContext> =
  Symbol('Counter');
