import {
  defineComponent,
  h,
  type PropType,
  computed,
  getCurrentInstance,
  callWithErrorHandling,
  ErrorCodes,
} from 'vue';
import {
  addTransitionEndCallback,
  getTransitionRunningCount,
  startTransitionWithCallback,
} from 'vuact';
import {
  useProvideFormStatus,
  sharedNotPendingObject,
} from './use-form-status';

export default defineComponent({
  name: 'Form',
  props: {
    action: {
      type: [String, Function] as PropType<string | ((data: FormData) => any)>,
      required: true,
    },
  },
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const instance = getCurrentInstance()!;

    const actionProp = computed(() => {
      const { action } = props;
      if (typeof action === 'function') {
        return (
          "javascript:throw new Error('" +
          'A React form was unexpectedly submitted. If you called form.submit() manually, ' +
          "consider using form.requestSubmit() instead. If you\\'re trying to use " +
          'event.stopPropagation() in a submit event handler, consider also calling ' +
          'event.preventDefault().' +
          "')"
        );
      }
      return action;
    });
    const formStatusContext = useProvideFormStatus();

    function handleSubmit(event: SubmitEvent) {
      if (attrs.onSubmit) {
        (attrs.onSubmit as any)(event);
      }

      let { action } = props;
      const submitter = event.submitter;
      if (submitter && (submitter as any)._$formAction) {
        action = (submitter as any)._$formAction;
      }
      const form = event.target as HTMLFormElement;

      if (event.defaultPrevented) {
        if (getTransitionRunningCount() > 0) {
          formStatusContext.value = {
            pending: true,
            data: new FormData(form),
            method: form.method,
            action,
          };

          addTransitionEndCallback(() => {
            formStatusContext.value = sharedNotPendingObject;
          });
        }
      } else if (typeof action === 'function') {
        event.preventDefault();

        const formData = new FormData(form);
        formStatusContext.value = {
          pending: true,
          data: formData,
          method: form.method,
          action,
        };

        startTransitionWithCallback(
          () => action(formData),
          (error) => {
            formStatusContext.value = sharedNotPendingObject;
            if (error !== undefined) {
              callWithErrorHandling(
                () => {
                  throw error;
                },
                instance,
                ErrorCodes.RENDER_FUNCTION
              );
            }
          }
        );
      }
    }

    function formRef(el: any) {
      // @private
      instance.exposeProxy = instance.exposed = el || {};
    }

    return () => {
      return h(
        'form',
        {
          ref: formRef,
          action: actionProp.value,
          ...attrs,
          onSubmit: handleSubmit,
        },
        slots.default?.()
      );
    };
  },
});
