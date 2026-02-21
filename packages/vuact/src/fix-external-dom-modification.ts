import { onErrorCaptured, Comment } from 'vue';
import type { VuactComponentInternalInstance } from './types';

class ExternalDomModificationError extends Error {}

/**
 * 对由外部修改 dom 导致的异常进行重新渲染
 *
 * vue 会将空渲染为 comment，而 react 不会渲染
 *
 * 所以 vue 对于这种情况，当 flag1 设为 true 之后，渲染 span 时会因为 parent 不存在而报错
 * ```
 * function Foo() {
 *   const ref1 = useRef<HTMLElement>();
 *   const [flag1, setFlag1] = useState(false);
 *   useEffect(() => {
 *     // 外部修改了 dom，清空了 div
 *     ref1.current!.innerHTML = '';
 *     // 触发渲染 span，react 由于第一次渲染时不会渲染内容而不会造成影响，而 vue 会因为渲染的 comment 从 div 去掉了，没有了 parentNode 而造成异常
 *     setFlag1(true);
 *   }, []);

 *   return createElement(
 *     'div',
 *     {
 *       ref: ref1,
 *     },
 *     createElement(Bar, { flag1 })
 *   );
 * }

 * function Bar({ flag1 }: any) {
 *   return flag1 ? createElement('span') : null;
 * }
 * ```
 */
export function fixExternalDomModification(
  vInstance: VuactComponentInternalInstance,
  currentRenderResult: any
) {
  const prevTree = vInstance.subTree;
  if (
    !(
      prevTree &&
      prevTree.type === Comment &&
      currentRenderResult &&
      prevTree.el &&
      !prevTree.el.parentNode
    )
  ) {
    return;
  }
  // 外部修改了 dom，上一次渲染了 comment，且这次渲染非空，且 prevTree.el.parentNode 为空（被外部修改了）

  // 查找最近的渲染了 HTMLElement 的 VuactComponentInternalInstance
  let targetVInstance: VuactComponentInternalInstance | null = vInstance.parent;
  while (targetVInstance) {
    if (targetVInstance._$vuactInternalInstance) {
      const el = targetVInstance.subTree?.el;
      if (!el) {
        targetVInstance = null;
        break;
      }
      if (el instanceof HTMLElement) {
        break;
      }
    }
    targetVInstance = targetVInstance.parent;
  }

  if (targetVInstance) {
    const targetInternalInstance = targetVInstance._$vuactInternalInstance!;

    if (!targetInternalInstance.externalDomModificationErrorCaptured) {
      targetInternalInstance.externalDomModificationErrorCaptured = (error) => {
        if (error instanceof ExternalDomModificationError) {
          const externalDomModificationRetryCount =
            targetInternalInstance.externalDomModificationRetryCount ?? 0;

          if (externalDomModificationRetryCount > 20) {
            return;
          }

          targetInternalInstance.externalDomModificationRetryCount =
            externalDomModificationRetryCount + 1;

          setTimeout(() => {
            targetInternalInstance.enqueueUpdate();
          });
          return false;
        }
      };
      onErrorCaptured(
        targetInternalInstance.externalDomModificationErrorCaptured,
        targetVInstance
      );
    }

    // hack 触发重新渲染
    vInstance.vnode.key = Symbol();

    throw new ExternalDomModificationError();
  }
}
