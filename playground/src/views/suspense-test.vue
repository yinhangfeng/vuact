<script setup lang="ts">
import {
  KeepAlive,
  ref,
  h,
  defineComponent,
  onActivated,
  onDeactivated,
  onErrorCaptured,
  queuePostFlushCb,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  onUpdated,
  Suspense,
} from 'vue';

const showComp1 = ref(true);
const comp1SetupError = ref(false);
const comp1Error = ref(false);
let comp1Error2 = false;
const count = ref(0);

const Comp1 = defineComponent({
  setup() {
    const instance = getCurrentInstance()!;
    console.log('Comp1 setup');

    const count = ref(0);

    onActivated(() => {
      console.log('Comp1 onActivated');
      count.value++;
    });

    onDeactivated(() => {
      console.log('Comp1 onDeactivated');
    });

    onBeforeMount(() => {
      console.log('Comp1 onBeforeMount');
      if (comp1SetupError.value) {
        throw new Error('Comp1 setup error');
      }
    });

    onMounted(() => {
      console.log('Comp1 onMounted');
    });

    onUpdated(() => {
      console.log('Comp1 onUpdated');
    });

    if (comp1SetupError.value) {
      instance.vnode.key = Symbol();
      // throw new Error('Comp1 setup error');

      return () => {
        console.log('Comp1 fake render');
      };
    }

    return () => {
      console.log('Comp1 render comp1Error:', comp1Error.value);

      if (comp1Error.value) {
        throw new Error('Comp1 error');
      }
      if (comp1Error2) {
        throw new Error('Comp1 error2');
      }

      return h('div', {}, [
        `Comp1 ${count.value}`,
        h(
          'button',
          {
            onClick: () => {
              count.value++;
            },
          },
          'count'
        ),
        h(
          'button',
          {
            onClick: () => {
              comp1Error.value = !comp1Error.value;
            },
          },
          'error'
        ),
      ]);
    };
  },
});

const Comp2 = defineComponent({
  async setup() {
    console.log('Comp2 setup');

    onActivated(() => {
      console.log('Comp2 onActivated');
    });

    onDeactivated(() => {
      console.log('Comp2 onDeactivated');
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 3000);
    });

    return () => {
      console.log('Comp2 render');

      return h('div', {}, ['Comp2 count:' + count.value]);
    };
  },
});

const CompParent = defineComponent({
  name: 'CompParent',
  setup() {
    console.log('CompParent setup');
    const count = ref(0);

    onActivated(() => {
      console.log('CompParent onActivated');
      count.value++;
    });

    onDeactivated(() => {
      console.log('CompParent onDeactivated');
    });

    return () => {
      console.log('CompParent render', count.value);

      return h('div', {}, [
        'CompParent start',
        h(Comp2),
        h(Comp1),
        'CompParent end',
      ]);
    };
  },
});

const SuspenseTest = defineComponent({
  setup: () => {
    const suspended = ref(false);
    const update = ref(0);

    onErrorCaptured((err) => {
      console.log('SuspenseTest onErrorCaptured', err);

      queuePostFlushCb(() => {
        suspended.value = true;
      });

      return false;
    });

    return () => {
      update.value;
      return [
        h('div', {}, 'SuspenseTest'),
        h(
          Suspense,
          {},
          {
            default: () => h(CompParent, {}),
            fallback: () => h('div', {}, 'Suspense fallback'),
          }
        ),
        h(
          'button',
          {
            onClick: () => {
              suspended.value = !suspended.value;
            },
          },
          'suspended'
        ),
        h(
          'button',
          {
            onClick: () => {
              comp1SetupError.value = !comp1SetupError.value;
            },
          },
          'comp1SetupError'
        ),
        h(
          'button',
          {
            onClick: () => {
              comp1Error.value = !comp1Error.value;
            },
          },
          'comp1Error'
        ),
        h(
          'button',
          {
            onClick: () => {
              comp1Error2 = !comp1Error2;
              ++update.value;
            },
          },
          'comp1Error2 ' + comp1Error2
        ),
        h(
          'button',
          {
            onClick: () => {
              comp1Error.value = !comp1Error.value;
              ++count.value;
            },
          },
          'comp1Error and incCount' + count.value
        ),
      ];
    };
  },
});

function test1() {
  showComp1.value = !showComp1.value;
}
</script>

<template>
  <button @click="test1">test1</button>
  <div>
    <SuspenseTest />
  </div>
</template>
