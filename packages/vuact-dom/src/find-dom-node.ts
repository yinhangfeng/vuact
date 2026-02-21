import type { ReactInstance } from 'react';
import type ReactDOM from 'react-dom';
import { isVuactComponentInstance } from 'vuact';
import { Teleport, isVNode, type VNode, type VNodeArrayChildren } from 'vue';

export const findDOMNode: typeof ReactDOM.findDOMNode = function findDOMNode(
  instance: ReactInstance | null | undefined
): Element | null | Text {
  if (instance == null) {
    return null;
  }

  let result: any;
  if (isVuactComponentInstance(instance)) {
    const internalInstance = instance._$internalInstance!;
    if (!internalInstance.element) {
      throw new Error('Unable to find node on an unmounted component.');
    }
    result = internalInstance.vInstance?.vnode?.el;
    let i = 0;
    while (isAnchorNode(result)) {
      result = result.nextSibling;
      ++i;
    }

    if (result == null && i > 1) {
      // 至少存在两个 anchor node 可能是 teleport start teleport end
      const teleportVNode = findTeleportVNode(
        internalInstance.vInstance.subTree
      );

      if (teleportVNode) {
        return teleportVNode.targetStart?.nextSibling;
      }
    }
  } else if (instance instanceof Element) {
    result = instance;
  } else {
    const keys = Object.keys(instance).join(',');
    throw new Error(
      `Argument appears to not be a ReactComponent. Keys: ${keys}`
    );
  }

  if (result instanceof Comment) {
    return null;
  }

  return result;
};

function isAnchorNode(node: Node) {
  return (node instanceof Text && !node.textContent) || node instanceof Comment;
}

function findTeleportVNode(node: any): VNode | undefined {
  if (!isVNode(node)) {
    return;
  }
  if (node.type === Teleport) {
    return node;
  }

  if (Array.isArray(node.children)) {
    const result = findTeleportVNodeFromChildren(node.children);
    if (result) {
      return result;
    }
  }

  if (node.component?.subTree) {
    const result = findTeleportVNode(node.component.subTree);
    if (result) {
      return result;
    }
  }
}

function findTeleportVNodeFromChildren(
  children: VNodeArrayChildren
): VNode | undefined {
  let result: VNode | undefined;
  for (const node of children) {
    if (Array.isArray(node)) {
      result = findTeleportVNodeFromChildren(node);
    } else {
      result = findTeleportVNode(node);
    }

    if (result) {
      return result;
    }
  }
}
