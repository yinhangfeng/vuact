import { callWithErrorHandling, ErrorCodes } from 'vue';
import { EMPTY_FUNC } from './constants';
import { type BaseEffectHook, type EffectHook, HookType } from './hooks';
import {
  currentRenderingInstance,
  setCurrentRenderingInstance,
} from './render-context';
import { scheduleEffectCallback } from './scheduler';
import type {
  VuactElement,
  VuactInternalFunctionInstance,
  VuactInternalInstance,
} from './types';

function enqueueForceUpdate(this: VuactInternalInstance) {
  // shouldComponentUpdate 只会在 element 改变时调用，如果只是本组件更新是不需要 force 标记的，但有可能本组件更新与父组件更新被合并
  this.force = true;
  this.dirty = true;
  this.enqueueUpdate();
}

function beforeUpdate(
  this: VuactInternalFunctionInstance,
  element: VuactElement
) {
  const oldElement = this.element;
  this.element = element;
  this.oldElement = oldElement;
  const props = element.props;
  const componentContext = this.contextRef.value;

  if (!oldElement) {
    this.props = props;
    this.context = componentContext;
  } else if (
    this.shouldComponentUpdate &&
    (element !== oldElement || !this.force) &&
    // renderEffect.dirty 为 true 代表 render 函数内有 reactive 触发了重新渲染，不需要走 shouldComponentUpdate
    !this.renderEffect.dirty &&
    this.shouldComponentUpdate(
      oldElement.props,
      props,
      oldElement.ref,
      element.ref
    ) === false
  ) {
    /**
     * function component 有 shouldComponentUpdate 的情况其实是 memo 组件，shouldComponentUpdate 只有在外部更新时才需要调用
     * 且只会影响是否更新 props，具体是否跳过渲染需要由 dirty 决定
     */
    this.renderSkipped = !this.dirty;
  } else {
    this.props = props;
    this.context = componentContext;
  }

  if (this.pendingEffects?.length) {
    const pendingEffects = this.pendingEffects;
    // pendingEffects 不为空说明新一轮的 render 早于 flushEffectQueue 调用
    for (const effect of pendingEffects) {
      invokeCleanupWithErrorHandling(effect, this);
    }
    try {
      for (const effect of pendingEffects) {
        invokeEffect(effect);
      }
    } finally {
      pendingEffects.length = 0;
    }
  }
}

function render(this: VuactInternalFunctionInstance) {
  let i = 0;
  let renderResult: any;
  do {
    this.dirty = false;

    this.currentHookIndex = -1;

    if (i > 0) {
      // 废弃上一次 render 设置的 pendingEffects pendingLayoutEffects pendingDeps
      if (this.pendingEffects) {
        this.pendingEffects.length = 0;
      }
      if (this.pendingLayoutEffects) {
        this.pendingLayoutEffects.length = 0;
      }
      for (const hook of this.hooks) {
        if (hook.onRerender) {
          hook.onRerender();
        }
      }
    }

    renderResult = this.componentType(this.props, this.context);
  } while (this.dirty && ++i < 25);

  return renderResult;
}

function renderError(this: VuactInternalFunctionInstance) {
  if (this.pendingEffects) {
    this.pendingEffects.length = 0;
  }
  if (this.pendingLayoutEffects) {
    this.pendingLayoutEffects.length = 0;
  }
  for (const hook of this.hooks) {
    if (hook.onRenderError) {
      hook.onRenderError();
    }
  }
}

function updated(this: VuactInternalFunctionInstance, sync: boolean) {
  this.oldElement = undefined;

  for (const hook of this.hooks) {
    if (hook.onUpdated) {
      hook.onUpdated();
    }
  }

  if (this.pendingLayoutEffects?.length) {
    if (sync) {
      this.renderContext.beforeCommitQueue.push(this.beforeCommit);
    } else {
      this.beforeCommit();
    }
  }
}

function beforeCommit(this: VuactInternalFunctionInstance) {
  const pendingLayoutEffects = this.pendingLayoutEffects;
  if (pendingLayoutEffects?.length) {
    for (const effect of pendingLayoutEffects) {
      invokeCleanupWithErrorHandling(effect, this);
    }
  }
}

function commit(this: VuactInternalFunctionInstance) {
  if (this.pendingEffects?.length) {
    enqueueEffect(this);
  }

  const pendingLayoutEffects = this.pendingLayoutEffects;
  if (pendingLayoutEffects?.length) {
    try {
      for (const effect of pendingLayoutEffects) {
        invokeEffect(effect);
      }
    } finally {
      pendingLayoutEffects.length = 0;
    }
  }
}

function beforeUnmount(this: VuactInternalFunctionInstance) {
  this.pendingEffects = undefined;
  this.pendingLayoutEffects = undefined;

  const hooks = this.hooks;
  let effectHooks: EffectHook[] | undefined;

  for (const hook of hooks) {
    if (hook.type === HookType.LayoutEffect) {
      invokeCleanupWithErrorHandling(hook, this);
    } else if (hook.type === HookType.Effect) {
      if (!effectHooks) {
        effectHooks = [];
      }
      effectHooks.push(hook);
    }
  }

  if (effectHooks) {
    for (const hook of effectHooks) {
      invokeCleanupWithErrorHandling(hook, this);
    }
  }
}

function imperativeHandleRef(this: VuactInternalFunctionInstance, ref: any) {
  this.imperativeHandle = ref;
}

export function setupFunctionInternalInstance(
  internalInstance: VuactInternalFunctionInstance
) {
  internalInstance.hooks = [];
  internalInstance.shouldComponentUpdate =
    internalInstance.componentType.prototype?.shouldComponentUpdate;

  internalInstance.enqueueForceUpdate =
    enqueueForceUpdate.bind(internalInstance);

  internalInstance.beforeUpdate = beforeUpdate;

  internalInstance.render = render;

  internalInstance.afterRender = EMPTY_FUNC;

  internalInstance.renderError = renderError;

  internalInstance.updated = updated;

  const bc: any = beforeCommit.bind(internalInstance);
  bc.instance = internalInstance;
  bc.vInstance = internalInstance.vInstance;
  internalInstance.beforeCommit = bc;

  internalInstance.commit = commit;

  internalInstance.beforeUnmount = beforeUnmount;

  internalInstance.imperativeHandleRef =
    imperativeHandleRef.bind(internalInstance);
}

let effectQueue: VuactInternalFunctionInstance[] = [];

function flushEffectQueue() {
  const length = effectQueue.length;
  for (let i = 0; i < length; i++) {
    const instance = effectQueue[i];
    const pendingEffects = instance.pendingEffects;
    if (pendingEffects) {
      for (const effect of pendingEffects) {
        invokeCleanupWithErrorHandling(effect, instance);
      }
    }
  }

  for (let i = 0; i < length; i++) {
    const instance = effectQueue[i];
    const pendingEffects = instance.pendingEffects;
    if (pendingEffects) {
      try {
        for (const effect of pendingEffects) {
          invokeEffectWithErrorHandling(effect, instance);
        }
      } finally {
        pendingEffects.length = 0;
      }
    }
  }

  if (effectQueue.length > length) {
    effectQueue = effectQueue.slice(length);
    scheduleEffectCallback(flushEffectQueue);
  } else {
    effectQueue.length = 0;
  }
}

function enqueueEffect(internalInstance: VuactInternalFunctionInstance) {
  if (effectQueue.push(internalInstance) === 1) {
    scheduleEffectCallback(flushEffectQueue);
  }
}

function invokeCleanupWithErrorHandling(
  hook: BaseEffectHook,
  internalInstance: VuactInternalFunctionInstance
) {
  const cleanup = hook.cleanup;
  if (cleanup) {
    hook.cleanup = undefined;
    const instance = currentRenderingInstance;
    setCurrentRenderingInstance(undefined);
    try {
      callWithErrorHandling(
        cleanup,
        internalInstance.vInstance,
        ErrorCodes.RENDER_FUNCTION
      );
    } catch (err) {
      console.error(err);
    } finally {
      setCurrentRenderingInstance(instance);
    }
  }
}

function invokeEffect(hook: BaseEffectHook) {
  const instance = currentRenderingInstance;
  setCurrentRenderingInstance(undefined);
  try {
    hook.cleanup = hook.value!();
  } finally {
    setCurrentRenderingInstance(instance);
  }
}

function invokeEffectWithErrorHandling(
  hook: EffectHook,
  internalInstance: VuactInternalFunctionInstance
) {
  const instance = currentRenderingInstance;
  setCurrentRenderingInstance(undefined);
  try {
    hook.cleanup = callWithErrorHandling(
      hook.value!,
      internalInstance.vInstance,
      ErrorCodes.RENDER_FUNCTION
    );
  } catch (err) {
    console.error(err);
  } finally {
    setCurrentRenderingInstance(instance);
  }
}
