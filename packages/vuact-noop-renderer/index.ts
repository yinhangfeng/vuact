import { nextTick, queuePostFlushCb } from 'vue';
import { act, flushAll } from 'vuact';
import {
  render as _render,
  createPortal,
  flushSync,
  unstable_batchedUpdates,
} from 'vuact-dom';
import { createRoot as _createRoot } from 'vuact-dom/client';

let roots: Record<string, any> = {};
let rootContainers: Record<string, any> = {};

function render(element: any, callback: any) {
  const root = createRoot();
  root.render(element);

  if (callback) {
    queuePostFlushCb(callback);
  }
  flushAll();
}

function renderLegacySyncRoot(element: any, callback: any) {
  _render(element, getOrCreateRootContainer(), callback);

  return nextTick();
}

function renderToRootWithID(element: any, rootId: string, callback: any) {
  const root = createRoot(rootId);
  root.render(element);
  if (callback) {
    queuePostFlushCb(callback);
  }
  flushAll();
}

function createRoot(id = '__DEFAULT__') {
  let root = roots[id];
  if (!root) {
    root = _createRoot(getOrCreateRootContainer(id));
    roots[id] = root;
  }
  return root;
}

function getOrCreateRootContainer(id = '__DEFAULT__') {
  if (!rootContainers[id]) {
    rootContainers[id] = document.createElement('div');
  }
  return rootContainers[id];
}

function elementToJson(element: Node) {
  let json: Record<string, any> | undefined;
  if (element.tagName) {
    json = {
      type: element.tagName.toLocaleLowerCase(),
      hidden: false,
      children: [],
    };

    for (const key in element) {
      if (
        Object.prototype.hasOwnProperty.call(element, key) &&
        key !== 'outerHTML' &&
        !key.startsWith('_$') &&
        key !== 'addEventListener' &&
        key !== 'removeEventListener'
      ) {
        json[key] = element[key];
      }
    }

    // 获取元素属性
    for (const attr of element.attributes) {
      let value: any = attr.value;
      const num = Number(value);
      if (!isNaN(num)) {
        value = num;
      }
      json[attr.name] = value;
    }

    // 获取样式
    // json.style = {};
    // for (const style of element.style) {
    //   json.style[style] = element.style[style];
    // }

    // 获取子元素
    for (const child of element.childNodes) {
      const node = elementToJson(child);
      if (node) {
        json.children.push(node);
      }
    }
  } else if (element instanceof Text && element.textContent) {
    json = {
      hidden: false,
      text: element.textContent,
    };
  }

  // 获取自定义属性

  return json;
}

function toJSON() {
  return elementToJson(roots.__DEFAULT__._internalRoot.containerInfo);
}

function getChildren() {
  return toJSON().children;
}

export default {
  // _Scheduler,
  getChildren,
  // dangerouslyGetChildren,
  // getPendingChildren,
  // dangerouslyGetPendingChildren,
  getOrCreateRootContainer,
  createRoot,
  createLegacyRoot: createRoot,
  // getChildrenAsJSX,
  // getPendingChildrenAsJSX,
  // getSuspenseyThingStatus,
  // resolveSuspenseyThing,
  // resetSuspenseyThingCache,
  createPortal,
  render,
  renderLegacySyncRoot,
  renderToRootWithID,
  // unmountRootWithID,
  // findInstance,
  // flushNextYield,
  // startTrackingHostCounters,
  // stopTrackingHostCounters,
  // expire,
  // flushExpired,
  batchedUpdates: unstable_batchedUpdates,
  // deferredUpdates,
  // discreteUpdates,
  // idleUpdates,
  flushSync,
  // flushPassiveEffects,
  act,
  // dumpTree,
  // getRoot,
  // unstable_runWithPriority,
  nextTick,
  _internalRoot: {
    get containerInfo() {
      return roots.__DEFAULT__._internalRoot.containerInfo;
    },
  },
  _reset: () => {
    roots = {};
    rootContainers = {};
  },
};
