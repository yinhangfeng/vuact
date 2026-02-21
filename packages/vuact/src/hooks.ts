import {
  useId as vUseId,
  callWithErrorHandling,
  ErrorCodes,
  callWithAsyncErrorHandling,
} from 'vue';
import type {
  Reducer,
  EffectCallback,
  Ref,
  DependencyList,
  RefObject,
  Context,
  SetStateAction,
  Dispatch,
  Usable,
} from 'react';
import type React from 'react';
import type { VuactContext, VuactInternalFunctionInstance } from './types';
import { currentRenderingInstance } from './render-context';
import { cancelEffectCallback, scheduleEffectCallback } from './scheduler';
import { setRef } from './ref';
import {
  startTransitionWithCallback,
  addTransitionEndCallback,
  _isInTransition,
} from './transition';
import { isThenable, resolveThenable } from './thenable';
import { EMPTY_FUNC } from './constants';
import { isContext, readContext } from './context';

export enum HookType {
  State,
  Reducer,
  Effect,
  LayoutEffect,
  Memo,
  Callback,
  Id,
  Ref,
  DeferredValue,
  Transition,
  Optimistic,
  ActionState,
}

export type Hook =
  | StateHook
  | ReducerHook
  | EffectHook
  | LayoutEffectHook
  | MemoHook
  | CallbackHook
  | IdHook
  | RefHook
  | DeferredValueHook
  | TransitionHook
  | OptimisticHook
  | ActionStateHook;

export interface BaseHook<T extends HookType = HookType> {
  type: T;
  onRerender?(): void;
  onRenderError?(): void;
  onUpdated?(): void;
}

export type Effect = () => void | Cleanup;
export type Cleanup = () => void;

export interface BaseReducerHook<T extends HookType = HookType, Action = any>
  extends BaseHook<T> {
  value: any;
  nextValue?: any;
  pendingActions: Action[];
  pendingActionIndex: number;
  pendingTransition?: boolean;
}

export interface StateHook<State = any>
  extends BaseReducerHook<HookType.State, SetStateAction<State>> {
  value: [State, Dispatch<SetStateAction<State>>];
  nextValue?: [State, Dispatch<SetStateAction<State>>];
}

export interface ReducerHook<State = any, Action = any>
  extends BaseReducerHook<HookType.Reducer, Action> {
  value: [State, Dispatch<Action>];
  nextValue?: [State, Dispatch<Action>];
  reducer: Reducer<State, Action>;
}

export interface BaseEffectHook<T extends HookType = HookType>
  extends BaseHook<T> {
  value?: Effect;
  cleanup?: Cleanup | void;
  deps?: DependencyList;
  pendingDeps?: DependencyList;
}

export interface EffectHook extends BaseEffectHook<HookType.Effect> {}

export interface LayoutEffectHook
  extends BaseEffectHook<HookType.LayoutEffect> {}

export interface MemoHook<T = any> extends BaseHook<HookType.Memo> {
  value: T;
  deps?: DependencyList;
}

export interface CallbackHook<T extends Function = Function>
  extends BaseHook<HookType.Callback> {
  value: T;
  deps?: DependencyList;
}

export interface IdHook extends BaseHook<HookType.Id> {
  value?: string;
}

export interface RefHook<T = any> extends BaseHook<HookType.Ref> {
  value?: RefObject<T>;
}

export interface DeferredValueHook<T = any>
  extends BaseHook<HookType.DeferredValue> {
  value?: T;
  timer?: any;
  mounted: boolean;
}

export interface TransitionHook extends BaseHook<HookType.Transition> {
  value: [boolean, React.TransitionStartFunction];
}

export interface OptimisticHook<State = any, Action = any>
  extends BaseHook<HookType.Optimistic> {
  value: [State, Dispatch<Action>];
  nextValue?: [State, Dispatch<Action>];
  optimisticActions: Action[];
  reducer?: (state: State, action: Action) => State;
  dispatch: Dispatch<Action>;
}

export interface ActionStateHook<State = any, Action = any>
  extends BaseHook<HookType.ActionState> {
  value: [
    state: State,
    dispatch: (action?: Action) => void,
    isPending: boolean,
  ];
  action: (state: State, action: Action) => any;
  pendingState?: [State];
}

function nextHook<T extends HookType>(
  type: T,
  create?: boolean
): Extract<Hook, { type: T }> | undefined {
  if (!currentRenderingInstance) {
    throw new Error(
      'Invalid hook call. Hooks can only be called inside of the body of a function component.'
    );
  }
  const index = ++(currentRenderingInstance as VuactInternalFunctionInstance)
    .currentHookIndex;
  const hooks = (currentRenderingInstance as VuactInternalFunctionInstance)
    .hooks;

  let hook: Hook | undefined;
  if (index < hooks.length) {
    hook = hooks[index];
    if (hook.type !== type) {
      throw new Error(
        'Invalid hook call. Hooks can only be called in the same order in which they were defined.'
      );
    }
  } else if (create) {
    hook = {
      type,
    } as any;
    hooks.push(hook!);
  }
  return hook as any;
}

function pushHook(hook: Hook) {
  (currentRenderingInstance as VuactInternalFunctionInstance).hooks.push(hook);
}

function baseReducerOnRenderError(this: BaseReducerHook) {
  this.nextValue = undefined;
  this.pendingActionIndex = 0;
}

function baseReducerOnUpdated(this: StateHook) {
  if (this.nextValue) {
    this.value = this.nextValue;
    this.nextValue = undefined;
  }
  if (this.pendingActions.length && !this.pendingTransition) {
    this.pendingActions.length = 0;
    if (this.pendingActionIndex !== undefined) {
      this.pendingActionIndex = 0;
    }
  }
}

export const useState: typeof React.useState = function useState<S>(
  initialState?: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
  let hook = nextHook(HookType.State)!;
  let value: [S, Dispatch<SetStateAction<S>>];
  if (!hook) {
    const instance = currentRenderingInstance as VuactInternalFunctionInstance;
    value = [
      typeof initialState === 'function'
        ? (initialState as () => S)()
        : initialState!,
      dispatch,
    ];
    hook = {
      type: HookType.State,
      value,
      pendingActions: [],
      pendingActionIndex: 0,
      onRenderError: baseReducerOnRenderError,
      onUpdated: baseReducerOnUpdated,
    };
    pushHook(hook);
    function dispatch(action: SetStateAction<S>) {
      if (!hook.pendingActions.length) {
        const currentState = hook.nextValue ? hook.nextValue[0] : hook.value[0];
        const nextState =
          typeof action === 'function'
            ? (action as (prevState: S) => S)(currentState)
            : action;
        if (Object.is(nextState, currentState)) {
          return;
        }
        hook.pendingActions.push(nextState);
      } else {
        hook.pendingActions.push(action);
      }
      if (_isInTransition) {
        hook.pendingTransition = true;
        addTransitionEndCallback(() => {
          hook.pendingTransition = false;
          instance.enqueueForceUpdate();
        });
      } else {
        instance.enqueueForceUpdate();
      }
    }
  } else {
    value = hook.nextValue || hook.value;
    if (
      hook.pendingActionIndex < hook.pendingActions.length &&
      !hook.pendingTransition
    ) {
      const pendingActions = hook.pendingActions;
      const length = pendingActions.length;
      let i = hook.pendingActionIndex;
      let nextState: S = value[0];
      for (; i < length; ++i) {
        const action = pendingActions[i];
        nextState = typeof action === 'function' ? action(nextState) : action;
      }
      hook.pendingActionIndex = i;
      value = hook.nextValue = [nextState, value[1]];
    }
  }

  return value;
};

export const useReducer: typeof React.useReducer = function useReducer<S, A>(
  reducer: (prevState: S, action: A) => S,
  initialState?: any,
  init?: (arg: any) => any
) {
  let hook = nextHook(HookType.Reducer)!;
  let value: [S, Dispatch<A>] | undefined;
  if (!hook) {
    const instance = currentRenderingInstance as VuactInternalFunctionInstance;
    value = [
      init
        ? init(initialState)
        : typeof initialState === 'function'
          ? initialState()
          : initialState,
      dispatch,
    ];
    hook = {
      type: HookType.Reducer,
      value,
      pendingActions: [],
      pendingActionIndex: 0,
      reducer,
      onRenderError: baseReducerOnRenderError,
      onUpdated: baseReducerOnUpdated,
    };
    pushHook(hook);
    function dispatch(action: A) {
      hook.pendingActions.push(action);
      if (_isInTransition) {
        hook.pendingTransition = true;
        addTransitionEndCallback(() => {
          hook.pendingTransition = false;
          instance.enqueueForceUpdate();
        });
      } else {
        instance.enqueueForceUpdate();
      }
    }
  } else {
    hook.reducer = reducer;
    value = hook.nextValue || hook.value;
    if (
      hook.pendingActionIndex < hook.pendingActions.length &&
      !hook.pendingTransition
    ) {
      const pendingActions = hook.pendingActions;
      const length = pendingActions.length;
      let i = hook.pendingActionIndex;
      let nextState = value[0];
      for (; i < length; ++i) {
        const action = pendingActions[i];
        nextState = hook.reducer(nextState, action);
      }
      hook.pendingActionIndex = i;
      value = hook.nextValue = [nextState, value[1]];
    }
  }

  return value;
};

function baseEffectOnRerender(this: BaseEffectHook) {
  this.pendingDeps = undefined;
}

function baseEffectOnRenderError(this: BaseEffectHook) {
  this.pendingDeps = undefined;
}

function baseEffectOnUpdated(this: BaseEffectHook) {
  if (this.pendingDeps) {
    this.deps = this.pendingDeps;
    this.pendingDeps = undefined;
  }
}

export const useEffect: typeof React.useEffect = function useEffect(
  callback: EffectCallback,
  deps?: DependencyList
) {
  let hook = nextHook(HookType.Effect);
  if (!hook) {
    hook = {
      type: HookType.Effect,
      onRerender: baseEffectOnRerender,
      onRenderError: baseEffectOnRenderError,
      onUpdated: baseEffectOnUpdated,
    };
    pushHook(hook);
  }

  if (depsChanged(hook.deps, deps)) {
    hook.value = callback;
    hook.pendingDeps = deps;
    const instance = currentRenderingInstance as VuactInternalFunctionInstance;
    let pendingEffects = instance.pendingEffects;
    if (!pendingEffects) {
      pendingEffects = instance.pendingEffects = [];
    }
    pendingEffects.push(hook);
  }
};

export const useLayoutEffect: typeof React.useLayoutEffect =
  function useLayoutEffect(callback: EffectCallback, deps?: DependencyList) {
    let hook = nextHook(HookType.LayoutEffect);
    if (!hook) {
      hook = {
        type: HookType.LayoutEffect,
        onRerender: baseEffectOnRerender,
        onRenderError: baseEffectOnRenderError,
        onUpdated: baseEffectOnUpdated,
      };
      pushHook(hook);
    }

    if (depsChanged(hook.deps, deps)) {
      hook.value = callback;
      hook.pendingDeps = deps;
      const instance =
        currentRenderingInstance as VuactInternalFunctionInstance;
      let pendingLayoutEffects = instance.pendingLayoutEffects;
      if (!pendingLayoutEffects) {
        pendingLayoutEffects = instance.pendingLayoutEffects = [];
      }
      pendingLayoutEffects.push(hook);
    }
  };

export const useRef: typeof React.useRef = function useRef<T>(
  initialValue?: T
): RefObject<T> {
  const hook = nextHook(HookType.Ref, true)!;
  let value = hook.value;
  if (!value) {
    value = hook.value = {
      current: initialValue as T,
    };
  }
  return value;
};

export const useImperativeHandle: typeof React.useImperativeHandle =
  function useImperativeHandle<T, R extends T>(
    ref: Ref<T> | undefined,
    init: () => R,
    deps?: DependencyList
  ) {
    useLayoutEffect(
      () => {
        if (!ref) {
          return;
        }
        const value = init();
        setRef(ref, value);
        return () => {
          setRef(ref, null);
        };
      },
      deps && deps.concat(ref)
    );
  };

export const useMemo: typeof React.useMemo = function useMemo<T>(
  factory: () => T,
  deps: DependencyList | undefined
): T {
  const hook = nextHook(HookType.Memo, true)!;
  if (depsChanged(hook.deps, deps)) {
    hook.value = factory();
    hook.deps = deps;
  }

  return hook.value;
};

export const useCallback: typeof React.useCallback = function useCallback<
  T extends Function,
>(callback: T, deps: DependencyList) {
  const hook = nextHook(HookType.Callback, true)!;
  if (depsChanged(hook.deps, deps)) {
    hook.value = callback;
    hook.deps = deps;
  }

  return hook.value as T;
};

export const useContext: typeof React.useContext = function useContext<T>(
  context: Context<T>
): T {
  return readContext(context as VuactContext<T>);
};

export const use: typeof React.use = function use<T>(usable: Usable<T>) {
  if (isThenable(usable)) {
    return resolveThenable(usable);
  } else if (isContext(usable)) {
    return readContext(usable as any);
  }

  throw new Error(`An unsupported type was passed to use(): ${usable as any}`);
};

export const useDebugValue: typeof React.useDebugValue = function useDebugValue<
  T,
>(value: T, format?: (value: T) => any) {
  // TODO
};

export const useId: typeof React.useId = function useId() {
  const hook = nextHook(HookType.Id, true)!;
  let value = hook.value;
  if (value === undefined) {
    value = hook.value = vUseId();
  }
  return value;
};

/**
 * This is taken from https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js#L84
 * on a high level this cuts out the warnings, ... and attempts a smaller implementation
 */
export const useSyncExternalStore: typeof React.useSyncExternalStore =
  function useSyncExternalStore<Snapshot>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    getServerSnapshot?: () => Snapshot
  ): Snapshot {
    const value = getSnapshot();

    const [{ inst }, forceUpdate] = useState(() => ({
      inst: { value, getSnapshot },
    }));

    useLayoutEffect(() => {
      inst.value = value;
      inst.getSnapshot = getSnapshot;

      if (checkIfSnapshotChanged<Snapshot>(inst)) {
        forceUpdate({ inst });
      }
    }, [subscribe, value, getSnapshot]);

    useEffect(() => {
      if (checkIfSnapshotChanged(inst)) {
        forceUpdate({ inst });
      }

      return subscribe(() => {
        if (checkIfSnapshotChanged(inst)) {
          forceUpdate({ inst });
        }
      });
    }, [subscribe]);

    return value;
  };

function checkIfSnapshotChanged<T>(inst: {
  value: T;
  getSnapshot: () => T;
}): boolean {
  const latestGetSnapshot = inst.getSnapshot;
  const prevValue = inst.value;
  try {
    const nextValue = latestGetSnapshot();
    return !Object.is(prevValue, nextValue);
  } catch {
    return true;
  }
}

export const useMutableSource: any = function useMutableSource() {};

export const useDeferredValue: typeof React.useDeferredValue =
  function useDeferredValue<T>(value: T, initialValue?: T): T {
    let hook = nextHook(HookType.DeferredValue)!;
    if (!hook) {
      hook = {
        type: HookType.DeferredValue,
        value: initialValue !== undefined ? initialValue : value,
        mounted: false,
      };
      pushHook(hook);
    } else if (!hook.mounted && initialValue === undefined) {
      hook.value = value;
    }

    const instance = currentRenderingInstance as VuactInternalFunctionInstance;
    useLayoutEffect(() => {
      if (!hook.mounted) {
        hook.mounted = true;
        if (Object.is(hook.value, value)) {
          return;
        }
      }
      // XXX setTimeout ?
      hook.timer = scheduleEffectCallback(() => {
        hook.timer = undefined;
        hook.value = value;
        instance.enqueueForceUpdate();
      });
      return () => {
        if (hook.timer) {
          cancelEffectCallback(hook.timer);
          hook.timer = undefined;
        }
      };
    }, [value]);

    return hook.value!;
  };

export const useTransition: typeof React.useTransition =
  function useTransition() {
    const hook = nextHook(HookType.Transition, true)!;
    let value = hook.value;
    if (!value) {
      const instance =
        currentRenderingInstance as VuactInternalFunctionInstance;
      const startTransition: React.TransitionStartFunction = (callback) => {
        const pending = hook.value[0];
        if (!pending) {
          hook.value = [true, startTransition];
          instance.enqueueForceUpdate();
        }
        startTransitionWithCallback(callback, (error) => {
          if (error !== undefined) {
            callWithErrorHandling(
              () => {
                throw error;
              },
              instance.vInstance,
              ErrorCodes.RENDER_FUNCTION
            );
          } else if (!pending && hook.value[0]) {
            hook.value = notTransitionValue;
            instance.enqueueForceUpdate();
          }
        });
      };

      const notTransitionValue: [boolean, React.TransitionStartFunction] = [
        false,
        startTransition,
      ];
      value = hook.value = notTransitionValue;
    }
    return value;
  };

// TODO 需要在 useLayoutEffect 之前调用
export const useInsertionEffect =
  useLayoutEffect as typeof React.useInsertionEffect;

export function getCacheForType<T>(resourceType: () => T): T {
  // TODO
  return resourceType();
}

export function useCacheRefresh() {
  // TODO
  return () => {};
}

const OPTIMISTIC_PASSTHROW_VALUE: any = [];

function optimisticOnRenderError(this: OptimisticHook) {
  this.nextValue = undefined;
}

function optimisticOnUpdated(this: OptimisticHook) {
  if (this.nextValue) {
    this.value = this.nextValue;
    this.nextValue = undefined;
  }
}

export const useOptimistic: typeof React.useOptimistic = function useOptimistic<
  State,
  Action,
>(passthrough: State, reducer?: (state: State, action: Action) => State): any {
  let hook = nextHook(HookType.Optimistic)!;
  let value: [State, Dispatch<Action>] | undefined;
  if (!hook) {
    const instance = currentRenderingInstance as VuactInternalFunctionInstance;

    value = [passthrough, dispatch];
    hook = {
      type: HookType.Optimistic,
      value: OPTIMISTIC_PASSTHROW_VALUE,
      optimisticActions: [],
      reducer,
      dispatch,
      onRenderError: optimisticOnRenderError,
      onUpdated: optimisticOnUpdated,
    };
    pushHook(hook);

    function dispatch(action: Action) {
      if (
        !addTransitionEndCallback(() => {
          hook.optimisticActions.length = 0;
          instance.enqueueForceUpdate();
        })
      ) {
        console.error(
          'An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition'
        );
        return;
      }
      hook.optimisticActions.push(action);
      instance.enqueueForceUpdate();
    }
  } else {
    hook.reducer = reducer;
    if (hook.optimisticActions.length) {
      const optimisticActions = hook.optimisticActions;
      let nextState = passthrough;
      for (let i = 0; i < optimisticActions.length; ++i) {
        const action = optimisticActions[i];
        nextState = hook.reducer
          ? hook.reducer(nextState, action)
          : typeof action === 'function'
            ? action(nextState)
            : action;
      }
      value = hook.nextValue = [nextState, hook.dispatch];
    } else {
      if ((hook.nextValue || hook.value) !== OPTIMISTIC_PASSTHROW_VALUE) {
        hook.nextValue = OPTIMISTIC_PASSTHROW_VALUE;
      }
      value = [passthrough, hook.dispatch];
    }
  }

  return value;
};

export const useActionState: typeof React.useActionState =
  function useActionState<State, Payload>(
    action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
    initialState?: Awaited<State>,
    permalink?: string
  ): [
    state: Awaited<State>,
    dispatch: (payload?: Payload) => void,
    isPending: boolean,
  ] {
    let hook = nextHook(HookType.ActionState)!;
    if (!hook) {
      const instance =
        currentRenderingInstance as VuactInternalFunctionInstance;

      hook = {
        type: HookType.ActionState,
        value: [initialState!, dispatch, false],
        action,
      };
      pushHook(hook);

      const queue: { payload: Payload; isInTransition: boolean }[] = [];
      let isDispatching = false;
      let hasTransitionFinishCallback = false;

      function dispatch(payload?: Payload) {
        if (currentRenderingInstance) {
          throw new Error('Cannot update form state while rendering.');
        }
        queue.push({ payload: payload!, isInTransition: _isInTransition });
        if (!isDispatching) {
          isDispatching = true;
          doDispatch();
        }
      }

      const nextDispatch = () => {
        if (queue.length) {
          doDispatch();
        } else {
          isDispatching = false;
        }
      };

      const commit = () => {
        let nextState: any;
        if (hook.pendingState) {
          nextState = hook.pendingState[0];
          hook.pendingState = undefined;
        } else {
          nextState = hook.value[0];
        }
        hook.value = [nextState, dispatch, false];
        instance.enqueueForceUpdate();
      };

      const onTransitionFinish = () => {
        hasTransitionFinishCallback = false;
        commit();
      };

      const doDispatch = () => {
        const { payload, isInTransition } = queue.shift()!;

        const runAction = () => {
          const currentState = hook.pendingState
            ? hook.pendingState[0]
            : hook.value[0];

          let actionSyncCallSuccess = false;
          const actionResult = callWithAsyncErrorHandling(
            () => {
              const res = hook.action(currentState, payload);
              actionSyncCallSuccess = true;
              return res;
            },
            instance.vInstance,
            ErrorCodes.RENDER_FUNCTION
          );
          if (isThenable(actionResult)) {
            actionResult.then((nextState: any) => {
              hook.pendingState = [nextState];
              if (!isInTransition) {
                commit();
              }
              nextDispatch();
            }, EMPTY_FUNC);
            return actionResult as any;
          } else {
            if (actionSyncCallSuccess) {
              hook.pendingState = [actionResult];
              if (!isInTransition) {
                commit();
              }
            }
            nextDispatch();
          }
        };

        if (isInTransition) {
          const currentValue = hook.value;
          if (!currentValue[2]) {
            hook.value = [currentValue[0], dispatch, true];
            instance.enqueueForceUpdate();
          }

          let transitionCallback: (() => void) | undefined;
          if (!hasTransitionFinishCallback) {
            hasTransitionFinishCallback = true;
            transitionCallback = onTransitionFinish;
          }
          startTransitionWithCallback(runAction, transitionCallback);
        } else {
          runAction();
        }
      };
    } else {
      hook.action = action;
    }

    return hook.value;
  };

function depsChanged(
  oldDeps: DependencyList | undefined,
  newDeps: DependencyList | undefined
) {
  if (!oldDeps || !newDeps || oldDeps.length !== newDeps.length) {
    return true;
  }
  for (let i = 0; i < oldDeps.length; ++i) {
    if (!Object.is(oldDeps[i], newDeps[i])) {
      return true;
    }
  }
  return false;
}
