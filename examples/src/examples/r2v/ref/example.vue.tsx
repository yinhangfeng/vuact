import { defineComponent, shallowRef } from 'vue';
import { r2v } from 'vuact';
import FunctionComponent from './function-component';
import ClassComponent from './class-component';

const VFunctionComponent = r2v(FunctionComponent);
const VClassComponent = r2v(ClassComponent);

export default defineComponent({
  setup: () => {
    const functionComponentRef =
      shallowRef<InstanceType<typeof VFunctionComponent>>();
    const classComponentRef =
      shallowRef<InstanceType<typeof VClassComponent>>();

    function incCount() {
      functionComponentRef.value?.instance?.incCount();
      classComponentRef.value?.instance.incCount();
    }

    return () => {
      return (
        <div>
          <button onClick={incCount}>incCount</button>
          <VFunctionComponent ref={functionComponentRef} />
          <VClassComponent ref={classComponentRef} />
        </div>
      );
    };
  },
});
