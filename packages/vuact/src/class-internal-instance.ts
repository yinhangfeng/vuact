import { shallowRef } from 'vue';
import type {
  VuactComponent,
  VuactElement,
  VuactInternalClassInstance,
} from './types';
import { setRef } from './ref';
import { updateQueue } from './updater';
import { globalConfig } from './config';
import type { SchedulerJob } from './scheduler';
import { propsWithoutRef } from './utils/props-without-ref';
import { EMPTY_FUNC } from './constants';
import { useGlobalChildContext } from './context';

function enqueueUpdateState(
  this: VuactInternalClassInstance,
  callback?: () => void
) {
  if (typeof callback === 'function') {
    let stateCallbacks = this.stateCallbacks;
    if (!stateCallbacks) {
      stateCallbacks = this.stateCallbacks = [];
    }
    stateCallbacks.push(callback);
  }
  this.dirty = true;
  this.enqueueUpdate();
}

function resolveClassComponentProps(props: any): any {
  if (!globalConfig.refAsProp || !('ref' in props)) {
    return props;
  }

  return propsWithoutRef(props);
}

export function setupClassInternalInstance(
  internalInstance: VuactInternalClassInstance
) {
  const componentType = internalInstance.componentType;
  let instance: VuactComponent;
  let useNewApi = false;
  let oldElement: VuactElement | undefined;
  let oldProps: any;
  let oldState: any;
  let needApplyRef = false;

  internalInstance.pendingStates = [];

  function processPendingStates(props: any) {
    const pendingStates = internalInstance.pendingStates;
    let nextState = instance.state;
    for (let pendingState of pendingStates) {
      let replace = false;
      if (typeof pendingState === 'function') {
        replace = pendingState._$replace;
        pendingState = pendingState(nextState, props);
      }
      if (replace) {
        nextState = pendingState;
      } else {
        nextState = {
          ...nextState,
          ...pendingState,
        };
      }
    }
    pendingStates.length = 0;
    internalInstance.nextState = nextState;
  }

  internalInstance.enqueueUpdateState = enqueueUpdateState;

  internalInstance.init = function init(element) {
    const props = resolveClassComponentProps(element.props);
    const componentContext = internalInstance.contextRef.value;
    instance = new componentType(props, componentContext, updateQueue);

    // XXX 可以判断当前组件为 Context.Provider 或者当前组件有 getChildContext，才需要 创建新的 childContext 且进行 provide
    // 但是理论上 getChildContext 可以随时设置
    const globalChildContext = useGlobalChildContext(
      internalInstance.globalContext,
      // 不支持在构造函数之后设置的 getChildContext
      !!instance.getChildContext
    );
    internalInstance.globalChildContext = globalChildContext;

    instance.updater = updateQueue;
    instance.props = props;
    instance.context = componentContext;
    if (instance.state === undefined) {
      instance.state = null as any;
    }
    instance._$internalInstance = internalInstance;

    internalInstance.pendingStates = [];
    internalInstance.stateNode = instance;
    internalInstance.publicInstance = instance;

    useNewApi = !!(
      instance.getSnapshotBeforeUpdate || componentType.getDerivedStateFromProps
    );

    if (instance.componentDidCatch || componentType.getDerivedStateFromError) {
      internalInstance.errorCaptured = function errorCaptured(error: any) {
        if (!internalInstance.element) {
          // 已经 unmouted 的组件不能作为 error boundary
          return;
        }
        if (componentType.getDerivedStateFromError) {
          instance.setState(componentType.getDerivedStateFromError(error));
        }
        if (instance.componentDidCatch) {
          try {
            // TODO error info
            instance.componentDidCatch(error, {});
            return false;
          } catch (err) {
            if (err !== error) {
              throw err;
            }
            return;
          }
        }
        return !componentType.getDerivedStateFromError;
      };
    }
  };

  internalInstance.beforeUpdate = function beforeUpdate(element) {
    oldElement = internalInstance.element;
    oldProps = instance.props;
    oldState = instance.state;
    const props = resolveClassComponentProps(element.props);
    const componentContext = internalInstance.contextRef.value;
    internalInstance.element = element;

    processPendingStates(props);

    if (componentType.getDerivedStateFromProps) {
      internalInstance.nextState = {
        ...internalInstance.nextState,
        ...componentType.getDerivedStateFromProps(
          props,
          internalInstance.nextState
        ),
      };
    }

    if (!oldElement) {
      if (instance.componentWillMount && !useNewApi) {
        instance.componentWillMount();
        if (instance.state !== oldState) {
          internalInstance.pendingStates.length = 0;
          internalInstance.nextState = instance.state;
        } else if (internalInstance.pendingStates.length) {
          processPendingStates(props);
        }
      }

      // if (instance.componentDidMount) {
      //   internalInstance._$renderCallbacks.push(instance.componentDidMount);
      // }

      instance.props = props;
      instance.context = componentContext;
    } else {
      if (
        instance.componentWillReceiveProps &&
        !useNewApi &&
        element !== oldElement
      ) {
        // 有可能外部触发更新但 element === oldElement ?
        instance.componentWillReceiveProps(props, componentContext);
        if (instance.state !== oldState) {
          internalInstance.pendingStates.length = 0;
          internalInstance.nextState = instance.state;
        } else if (internalInstance.pendingStates.length) {
          processPendingStates(props);
        }
      }

      if (
        instance.shouldComponentUpdate &&
        !internalInstance.force &&
        // renderEffect.dirty 为 true 代表 render 函数内有 reactive 触发了重新渲染，不需要走 shouldComponentUpdate
        !internalInstance.renderEffect.dirty &&
        instance.shouldComponentUpdate(
          props,
          internalInstance.nextState,
          componentContext
        ) === false
      ) {
        internalInstance.renderSkipped = true;
      } else {
        if (instance.componentWillUpdate && !useNewApi) {
          instance.componentWillUpdate(
            props,
            internalInstance.nextState,
            componentContext
          );
        }

        // if (instance.componentDidUpdate) {
        //   enqueueComponentDidUpdate(oldElement.props, instance.state);
        // }
      }

      instance.props = props;
      instance.context = componentContext;
    }

    needApplyRef =
      oldElement?.ref !== element.ref && !componentType._$forwarded;
    // if (needApplyRef && oldElement?.ref) {
    //   oldElement.ref._$pending_set_null = true;
    // }
  };

  if (componentType.contextTypes) {
    internalInstance.beforeRender = function beforeRender() {
      // track legacy context
      internalInstance.contextRef.value;
    };
  }

  internalInstance.render = function render() {
    let i = 0;
    let renderResult: any;
    do {
      if (internalInstance.pendingStates.length) {
        processPendingStates(instance.props);
      }
      if (internalInstance.nextState) {
        instance.state = internalInstance.nextState;
        internalInstance.nextState = undefined;
      }
      if (i >= 2) {
        break;
      }
      internalInstance.dirty = false;
      renderResult = instance.render(instance.props, instance.context);
      ++i;
    } while (internalInstance.dirty);

    return renderResult;
  };

  internalInstance.skipRender = function skipUpdateRender() {
    if (internalInstance.nextState) {
      instance.state = internalInstance.nextState;
      internalInstance.nextState = undefined;
    }
  };

  internalInstance.afterRender = function afterRender() {
    if (instance.getChildContext) {
      const globalChildContext = internalInstance.globalChildContext!;
      if (globalChildContext) {
        const globalContext = internalInstance.globalContext;
        const childContext = instance.getChildContext();
        if (globalChildContext.context === globalContext.context) {
          globalChildContext.context = shallowRef({
            ...globalContext.context?.value,
            ...childContext,
          });
        } else {
          // 会导致依赖的 context 的子组件 forceUpdate
          // 如果本身由于递归渲染子组件同步渲染了则 forceUpdate scheduler 运行时会检查 dirty，不会重复运行
          globalChildContext.context!.value = {
            ...globalContext.context?.value,
            ...childContext,
          };
        }
      }
    }

    if (instance.getSnapshotBeforeUpdate && oldElement) {
      internalInstance.snapshot = instance.getSnapshotBeforeUpdate(
        oldElement.props,
        oldState
      );
    }
  };

  internalInstance.renderError = EMPTY_FUNC;

  internalInstance.updated = function updated(sync: boolean) {
    if (needApplyRef && oldElement?.ref) {
      const oldRef = oldElement.ref;
      if (sync) {
        const job: SchedulerJob = () => {
          setRef(oldRef, null);
        };
        job.instance = internalInstance;
        job.vInstance = internalInstance.vInstance;
        internalInstance.renderContext.beforeCommitQueue.push(job);
      } else {
        setRef(oldRef, null);
      }
    }
  };

  internalInstance.commit = function commit() {
    if (!oldElement) {
      instance.componentDidMount?.();
    } else if (instance.componentDidUpdate && !internalInstance.renderSkipped) {
      instance.componentDidUpdate(
        oldProps,
        oldState,
        internalInstance.snapshot
      );
    }
    oldElement = undefined;
    oldProps = undefined;
    oldState = undefined;
    internalInstance.snapshot = undefined;

    const stateCallbacks = internalInstance.stateCallbacks;
    if (stateCallbacks?.length) {
      internalInstance.stateCallbacks = undefined;
      for (const cb of stateCallbacks) {
        cb.call(instance);
      }
    }

    if (needApplyRef && internalInstance.element!.ref) {
      setRef(internalInstance.element!.ref, instance);
    }
  };

  internalInstance.beforeUnmount = function beforeUnmount() {
    const ref = internalInstance.element?.ref;
    if (ref && !componentType._$forwarded) {
      setRef(ref, null);
    }

    instance.componentWillUnmount?.();
  };
}
