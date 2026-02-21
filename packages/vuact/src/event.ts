import { EMPTY_FUNC } from './constants';

export interface SyntheticEvent extends Event {
  persist: () => void;
  isPropagationStopped: () => boolean;
  isDefaultPrevented: () => boolean;
  nativeEvent: Event;
}

export function isOn(key: string) {
  return (
    key.charCodeAt(0) === 111 /* o */ &&
    key.charCodeAt(1) === 110 /* n */ &&
    // uppercase letter
    (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97)
  );
}

export function isEventProp(key: string, value: any) {
  return isOn(key) && typeof value === 'function';
}

export function normalizeEventPropKey(key: string) {
  // vue 需要 event 转成小写，比如 onMouseDown => onMousedown
  // TODO 是否需要判断一下事件，或者判断一下是否为 custom element
  if (key === 'onClick') {
    return key;
  }
  let rest = key.slice(3);
  if (key.endsWith('Capture')) {
    rest = `${rest.slice(0, -7).toLowerCase()}Capture`;
  } else if (key.endsWith('Passive')) {
    rest = `${rest.slice(0, -6).toLowerCase()}Passive`;
  } else if (key.endsWith('Once')) {
    rest = `${rest.slice(0, -4).toLowerCase()}Once`;
  } else {
    rest = rest.toLowerCase();
  }
  return `${key.slice(0, 3)}${rest}`;
}

export function createEventProxy(listener: any) {
  let proxy = listener._$proxy;
  if (!proxy) {
    proxy = (event: Event) => {
      return listener(createSyntheticEvent(event));
    };
    listener._$proxy = proxy;
  }
  return proxy;
}

export const CHANGE_EVENT_ELEMENTS: Record<string, boolean> = {
  input: true,
  select: true,
  textarea: true,
};

const DELAY_CHANGE_INPUT_TYPES: Record<string, boolean> = {
  text: true,
  email: true,
  // XXX 加减箭头点击时是会立即触发 change 的
  number: true,
  password: true,
  search: true,
  tel: true,
  url: true,
  datetime: true,
};

function isDelayChangeInputType(type: string | undefined) {
  return !type || !!DELAY_CHANGE_INPUT_TYPES[type];
}

const CHANGE_EVENT_NAMES: Record<string, boolean> = {
  onChange: true,
  onChangeCapture: true,
  onChangePassive: true,
  onChangeOnce: true,
};

export function onInputForChange(e: Event) {
  const target = e.target as HTMLElement;
  if (
    target &&
    (target.tagName !== 'INPUT' ||
      isDelayChangeInputType((target as HTMLInputElement).type))
  ) {
    target.dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: true,
      })
    );
  }
}

export function processEventProp(
  key: string,
  prop: any,
  props: Record<string, any>,
  type: string
) {
  key = normalizeEventPropKey(key);
  if (!CHANGE_EVENT_ELEMENTS[type]) {
    props[key] = prop && createEventProxy(prop);
  } else if (key === 'onInput') {
    if (prop) {
      let proxy = prop._$proxy;
      if (!proxy) {
        proxy = (event: Event) => {
          try {
            return prop(createSyntheticEvent(event));
          } finally {
            onInputForChange(event);
          }
        };
        prop._$proxy = proxy;
      }
      props.onInput = proxy;
    }
  } else {
    props[key] = prop && createEventProxy(prop);
    if (CHANGE_EVENT_NAMES[key] && !props.onInput) {
      props.onInput = onInputForChange;
    }
  }
}

export function createSyntheticEvent(ev: Event) {
  const event = ev as SyntheticEvent;
  event.persist = EMPTY_FUNC;
  event.isPropagationStopped = isPropagationStopped;
  event.isDefaultPrevented = isDefaultPrevented;
  event.nativeEvent = ev;
  return event;
}

function isPropagationStopped(this: SyntheticEvent) {
  return this.cancelBubble;
}

function isDefaultPrevented(this: SyntheticEvent) {
  return this.defaultPrevented;
}
