import type { VuactComponent } from '../types';

export function isVuactComponentInstance(obj: any): obj is VuactComponent {
  return !!(obj as VuactComponent)?._$internalInstance;
}
