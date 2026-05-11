import { Modal as RModal, Modal as RModalStatic } from 'antd';
import { r2v } from 'vuact';

export const Modal = r2v(RModal, {
  vModel: [{ modelName: 'open', prop: 'open', event: 'onOpenChange' }],
  slotsTransformConfig: {
    footer: { elementProp: true },
    children: { elementProp: true },
  },
});

export const ModalConfirm = Object.assign(Modal, {
  confirm: (RModalStatic as any).confirm,
  destroyAll: (RModalStatic as any).destroyAll,
  config: (RModalStatic as any).config,
});

export default Modal;
