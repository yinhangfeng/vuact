import { isRef, type VNodeRef } from 'vue';

export type VNodeNormalizedRefAtom = {
  /**
   * component instance
   */
  i: any;
  /**
   * Actual ref
   */
  r: VNodeRef;
  /**
   * setup ref key
   */
  k?: string;
  /**
   * refInFor marker
   */
  f?: boolean;
};

export type VNodeNormalizedRef =
  | VNodeNormalizedRefAtom
  | VNodeNormalizedRefAtom[];

export function isRawSlots(slots: any): slots is Record<string, any> {
  return typeof slots === 'object' && slots && !Array.isArray(slots);
}

export function setRawRef(rawRef: VNodeNormalizedRef, value: any) {
  if (Array.isArray(rawRef)) {
    rawRef.forEach((r) => setRawRef(r, value));
    return;
  }

  const { r: ref } = rawRef;

  if (typeof ref === 'function') {
    ref(value, {});
  } else if (isRef(ref)) {
    ref.value = value;
  } else {
    // TODO
  }
}
