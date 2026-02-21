import type { VuactRef } from './types';
import type { RenderContext } from './render-context';

export function setRef<T>(ref: VuactRef<T>, value: T) {
  if (typeof ref == 'function') {
    if (value === null) {
      if (ref._$cleanup) {
        ref._$cleanup();
      } else {
        ref(null);
      }
    } else {
      const maybeCleanup = ref(value);
      if (typeof maybeCleanup === 'function') {
        ref._$cleanup = maybeCleanup;
      } else if (ref._$cleanup) {
        ref._$cleanup = undefined;
      }
    }
  } else {
    ref.current = value;
  }
}

// export function applyRef<T>(ref: VuactRef<T>, value: T) {
//   if (ref._$pending_set_null) {
//     setRef(ref, null);
//     ref._$pending_set_null = false;
//     if (value != null) {
//       setRef(ref, value);
//     }
//   } else if (value != null) {
//     setRef(ref, value);
//   }
// }

export function reactRefToVueRef(
  ref: VuactRef<any>,
  renderContext?: RenderContext
) {
  let vRef = ref._$v_ref;
  if (!vRef) {
    vRef = (v: any) => {
      if (renderContext?.currentUpdateRootInstance) {
        if (v == null) {
          renderContext.beforeCommitQueue.push(() => setRef(ref, null));
        } else {
          renderContext.commitQueue.push(() => setRef(ref, v));
        }
      } else {
        setRef(ref, v);
      }
    };
    // 将函数伪装成 vue ref 使得 vue setRef 会回调 oldRef null
    vRef.__v_isRef = true;
    Object.defineProperty(vRef, 'value', {
      set: vRef,
    });
    ref._$v_ref = vRef;
  }
  return vRef;
}
