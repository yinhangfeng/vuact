import { effectScope, shallowRef, type Ref, type EffectScope } from 'vue';
// eslint-disable-next-line vue/prefer-import-from-vue
import { pauseTracking, resetTracking } from '@vue/reactivity';
import { useLayoutEffect, useRef } from './hooks';
import { EMPTY_ARR } from './constants';

interface ScopeContext<T, A> {
  scope: EffectScope;
  args: Ref<A | undefined>;
  result: T;
}

export function useVueEffectScope<T, A>(fn: (args: Ref<A | undefined>) => T): T;
export function useVueEffectScope<T, A>(fn: (args: Ref<A>) => T, args: A): T;
/**
 * 创建一个 Vue effectScope，并与当前组件生命周期绑定，在 scope 内部可执行 Vue hooks
 * @param fn scope 函数，函数只会执行一次。如果需要外部闭包的参数请通过 args 传递，不能直接使用外部闭包变量
 * @param args 传递给 fn 函数的参数，会转为 ref 传递给 fn 函数，args 改变时会更新 ref
 * @returns fn 函数的返回值
 */
export function useVueEffectScope<T, A>(
  fn: (args: Ref<A | undefined>) => T,
  args?: A
): T {
  const ref = useRef<ScopeContext<T, A>>(null as any);
  if (!ref.current) {
    const scope = effectScope();
    const argsRef = shallowRef(args as A);
    ref.current = {
      scope,
      args: argsRef,
      result: scope.run(() => {
        pauseTracking();
        try {
          return fn(argsRef);
        } finally {
          resetTracking();
        }
      }) as T,
    };
  } else {
    ref.current.args.value = args;
  }

  useLayoutEffect(() => {
    return () => {
      ref.current.scope.stop();
    };
  }, EMPTY_ARR);

  return ref.current.result;
}
