import type ReactDOM from 'react-dom';
import { REACT_PORTAL_TYPE } from 'vuact';

export const createPortal: typeof ReactDOM.createPortal = function createPortal(
  children: any,
  containerInfo: any,
  key?: any
) {
  return {
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children,
    containerInfo,
  } as any;
};
