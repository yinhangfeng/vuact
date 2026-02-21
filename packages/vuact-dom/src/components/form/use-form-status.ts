import { inject, provide, shallowRef, type InjectionKey } from 'vue';
import { type FormStatus } from 'react-dom';

interface FormStatusContext {
  value: FormStatus;
}

const FormStatusInjectionKey: InjectionKey<FormStatusContext> =
  Symbol('FormStatus');

export const sharedNotPendingObject: FormStatus = {
  pending: false,
  data: null,
  method: null,
  action: null,
};

const defaultFormStatusContext = {
  value: sharedNotPendingObject,
};

export function useProvideFormStatus() {
  const context: FormStatusContext = shallowRef(sharedNotPendingObject);
  provide(FormStatusInjectionKey, context);
  return context;
}

export function useFormStatus() {
  const formStatusContext = inject(
    FormStatusInjectionKey,
    defaultFormStatusContext
  );
  return formStatusContext.value;
}
