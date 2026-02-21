<script setup lang="tsx">
import * as Vuact from 'vuact';
import VuactDOM from 'vuact-dom';
import VuactDOMClient from 'vuact-dom/client';
import VuactDOMServer from 'vuact-dom/server';
import VuactTestUtils from 'vuact-dom/test-utils';
import _React from 'react';
import _ReactDOM from 'react-dom';
import _ReactDOMClient from 'react-dom/client';
import _ReactDOMServer from 'react-dom/server';
import _ReactTestUtils from 'react-dom/test-utils';
import PropTypes from 'prop-types';
import {
  h,
  ref,
  nextTick,
  createVNode,
  render as vRender,
  defineComponent,
} from 'vue';
// import * as ReactCache from 'react-cache';
import VuactSchedulerMock from 'scheduler/vuact_mock';
import ReactSchedulerMock from 'scheduler/unstable_mock';
import { reactToVue } from 'vuact';
import ElementRefTest1 from '../test/vue/element-ref-test1.vue';

const useVuact = localStorage.getItem('useVuact') !== 'false';
let React: typeof _React;
let ReactDOM: any;
let ReactDOMClient: any;
let ReactDOMServer: any;
let ReactTestUtils: any;
let flushAll = () => {};
let Scheduler: any;
let act: any;
const gate = () => {};
if (useVuact) {
  React = Vuact;
  ReactDOM = VuactDOM;
  ReactDOMClient = VuactDOMClient;
  ReactDOMServer = VuactDOMServer;
  ReactTestUtils = VuactTestUtils;
  flushAll = Vuact.flushAll;
  Scheduler = VuactSchedulerMock;
  act = React.act;
} else {
  React = _React;
  ReactDOM = _ReactDOM;
  ReactDOMClient = _ReactDOMClient;
  ReactDOMServer = _ReactDOMServer;
  ReactTestUtils = _ReactTestUtils;
  Scheduler = ReactSchedulerMock;
  Scheduler.log = () => {};
  act = async (cb: any) => {
    await cb();
    return new Promise((resolve) => setTimeout(resolve, 150));
  };
}
const {
  Children,
  createMutableSource,
  createRef,
  Component,
  PureComponent,
  createContext,
  createServerContext,
  forwardRef,
  lazy,
  memo,
  useCallback,
  useContext,
  use,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useMutableSource,
  useSyncExternalStore,
  useReducer,
  useRef,
  useState,
  useOptimistic,
  useActionState,
  Fragment,
  Profiler,
  StrictMode,
  // unstable_DebugTracingMode,
  Suspense,
  createElement,
  cloneElement,
  isValidElement,
  version,
  // Deprecated behind disableCreateFactory
  createFactory,
  // Concurrent Mode
  useTransition,
  startTransition,
  useDeferredValue,
  SuspenseList,
  // unstable_LegacyHidden,
  // unstable_Offscreen,
  // unstable_getCacheSignal,
  // unstable_getCacheForType,
  // unstable_useCacheRefresh,
  // unstable_Cache,
  // // enableScopeAPI
  // unstable_Scope,
  // // enableTransitionTracing
  // unstable_TracingMarker,
  useId,
} = React;
const scheduleCallback = Scheduler.unstable_scheduleCallback;

const ReactNoop = {
  render(ele) {
    if (!this.container) {
      this.container = getContainer();
    }
    ReactDOM.render(ele, this.container);
  },
  createRoot: () => {
    return ReactDOMClient.createRoot(getContainer());
  },
};

const ReactTestRenderer = {
  create(element, options) {
    const container = getContainer();
    const root = ReactDOMClient.createRoot(container);
    root.render(element);

    const entry = {
      root,
      toJSON() {},
      toTree() {},
      update(newElement) {
        root.render(newElement);
      },
      unmount() {
        root.unmount();
      },
      getInstance() {},

      unstable_flushSync: () => {},
    };

    return entry;
  },
  unstable_batchedUpdates: ReactDOM.unstable_batchedUpdates,
};

function getContainer() {
  const container = document.createElement('div');
  document.getElementById('test-container')!.append(container);
  return container;
}

function waitRender() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function assertLog() {}
function waitForThrow() {}
function assertConsoleErrorDev() {}

//================== textCache ==================
const textCache = new Map();

function resolveText(text) {
  const record = textCache.get(text);
  if (record === undefined) {
    const newRecord = {
      status: 'resolved',
      value: text,
    };
    textCache.set(text, newRecord);
  } else if (record.status === 'pending') {
    const thenable = record.value;
    record.status = 'resolved';
    record.value = text;
    thenable.pings.forEach((t) => t());
  }
}

function readText(text) {
  const record = textCache.get(text);
  if (record !== undefined) {
    switch (record.status) {
      case 'pending':
        Scheduler.log(`Suspend! [${text}]`);
        throw record.value;
      case 'rejected':
        throw record.value;
      case 'resolved':
        return record.value;
    }
  } else {
    Scheduler.log(`Suspend! [${text}]`);
    const thenable = {
      pings: [],
      then(resolve) {
        if (newRecord.status === 'pending') {
          thenable.pings.push(resolve);
        } else {
          Promise.resolve().then(() => resolve(newRecord.value));
        }
      },
    };

    const newRecord = {
      status: 'pending',
      value: thenable,
    };
    textCache.set(text, newRecord);

    throw thenable;
  }
}

function getText(text) {
  const record = textCache.get(text);
  if (record === undefined) {
    const thenable = {
      pings: [],
      then(resolve) {
        if (newRecord.status === 'pending') {
          thenable.pings.push(resolve);
        } else {
          Promise.resolve().then(() => resolve(newRecord.value));
        }
      },
    };
    const newRecord = {
      status: 'pending',
      value: thenable,
    };
    textCache.set(text, newRecord);
    return thenable;
  } else {
    switch (record.status) {
      case 'pending':
        return record.value;
      case 'rejected':
        return Promise.reject(record.value);
      case 'resolved':
        return Promise.resolve(record.value);
    }
  }
}

function Text({ text }) {
  Scheduler.log(text);
  return text;
}

function AsyncText({ text }) {
  console.log('AsyncText render', text);
  try {
    readText(text);
  } catch (err) {
    console.log('AsyncText readText err', err, text);
    throw err;
  }
  Scheduler.log(text);
  return text;
}
//================== textCache end ==================

// ================= test ==================
async function test() {
  const container = getContainer();
  const root = ReactDOMClient.createRoot(container);

  async function submitForm(query) {
    console.log('submitForm', query, Array.from(query.entries()));
    await new Promise((res) => setTimeout(res, 1000));
  }

  async function action1(query) {
    console.log('action1', query, Array.from(query.entries()));
    await new Promise((res) => setTimeout(res, 1000));
  }

  async function action2(query) {
    console.log('action2', query, Array.from(query.entries()));
    await new Promise((res) => setTimeout(res, 1000));
  }

  async function action3(query) {
    console.log('action3', query, Array.from(query.entries()));
    await new Promise((res) => setTimeout(res, 1000));
  }

  function Submit() {
    const status = ReactDOM.useFormStatus();
    console.log('Submit render', status);
    return <button disabled={status.pending}>Submit</button>;
  }

  function App() {
    function onSubmit(e) {
      console.log('onSubmit', e);

      e.stopPropagation();
      // e.preventDefault();

      startTransition(async () => {
        console.log('onSubmit startTransition');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log('onSubmit startTransition end');
      });
    }
    return (
      <form action={submitForm} onSubmit={onSubmit}>
        <input name="input1" />
        <Submit />
        <button formAction={action1}>action1</button>
        <input type="submit" formAction={action2} value="action2" />
        <input type="image" formAction={action3} value="action3" />
      </form>
    );
  }

  root.render(<App />);
}

async function testTransitionSuspense() {
  let setState: any;
  let startTransition: any;

  function App() {
    const [state, _setState] = useState('aaa');
    const [isPending, _startTransition] = useTransition();
    setState = _setState;
    startTransition = _startTransition;
    return (
      <div>
        isPending: {String(isPending)}
        <Suspense fallback={<Text text="Loading..." />}>
          <AsyncText text={state} />
        </Suspense>
      </div>
    );
  }

  const container = getContainer();
  const root = ReactDOMClient.createRoot(container);
  root.render(<App />);

  resolveText('aaa');

  await new Promise((resolve) => setTimeout(resolve, 1000));

  startTransition(() => {
    setState('bbb');
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  resolveText('bbb');

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function testUseActionState() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });

  function Test() {
    console.log('Test render');
    const [_, _forceUpdate] = React.useState(0);
    const forceUpdate = () => {
      _forceUpdate((v) => v + 1);
    };
    const [state, dispatch, isPending] = React.useActionState(
      async (state, payload) => {
        console.log('action', state, payload);
        if (payload.xxx) {
          dispatch({
            aaa: 2,
          });
        }

        if (payload.error) {
          throw new Error('xxx');
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        // throw new Error('xxx');
        console.log('action end');
        return {
          ...state,
          aaa: state.aaa + payload.aaa,
        };
      },
      { aaa: 1 },
      'xxx'
    );
    console.log('Test render after useActionState', state, isPending);

    if (state.aaa >= 11) {
      console.log('Test render use');
      try {
        use(promise);
      } catch (err) {
        console.log('Test render use err', err);
        throw err;
      }
    }

    const [isPending1, startTransition] = useTransition();

    async function test1() {
      const res = React.startTransition(async () => {
        console.log('startTransition');
        const res = dispatch({
          aaa: 10,
          // error: true,
        });
        console.log('dispatch res', res);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('startTransition end');

        // dispatch({
        //   aaa: 20,
        //   // error: true,
        // });
      });
      console.log('startTransition res', res);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log('test1 resolve');
      resolve();
    }

    async function test2() {
      const res = startTransition(async () => {
        console.log('startTransition1');
        const res = dispatch({
          aaa: 1,
        });
        console.log('dispatch res', res);
        // await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('startTransition1 end');
      });
      console.log('startTransition res', res);
    }

    async function test3() {
      dispatch({
        aaa: 1,
      });
      dispatch({
        aaa: 1,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch({
        aaa: 1,
      });
    }

    async function test4() {
      React.startTransition(async () => {
        console.log('startTransition');
        const res = dispatch({
          aaa: 1,
        });
        dispatch({
          aaa: 2,
          // error: true,
        });

        setTimeout(() => {
          console.log('forceUpdate');
          forceUpdate();
        }, 2100);

        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log('startTransition end');
      });
      React.startTransition(async () => {
        console.log('startTransition1');
        dispatch({
          aaa: 3,
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
        // dispatch({
        //   aaa: 1,
        // });
        console.log('startTransition1 end');
      });
    }

    async function test5() {
      React.startTransition(async () => {
        console.log('startTransition');
        dispatch({
          aaa: 1,
          xxx: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log('startTransition end');
      });
    }

    async function test6() {
      React.startTransition(async () => {
        console.log('startTransition');
        dispatch({
          aaa: 2,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));

        dispatch({
          aaa: 3,
        });
        console.log('startTransition end');
      });

      // dispatch({
      //   aaa: 1,
      // });
    }

    console.log('Test render', {
      state,
      isPending,
      isPending1,
    });

    return (
      <>
        <button onClick={test1}>test1</button>
        <button onClick={test2}>test2</button>
        <button onClick={test3}>test3</button>
        <button onClick={test4}>test4</button>
        <button onClick={test5}>test5</button>
        <button onClick={test6}>test6</button>
      </>
    );
  }

  const container = getContainer();
  const root = ReactDOMClient.createRoot(container);
  root.render(
    <Suspense fallback={<div>xxx</div>}>
      <Test />
    </Suspense>
  );
}

async function testStartTransition() {
  function Test() {
    console.log('Test render');
    const [state, setState] = useState(0);
    const [state1, setState1] = useState(0);
    let reducer2Res;
    try {
      reducer2Res = useReducer((state, action) => {
        console.log('reducer', state, action);
        return action;
      }, 0);
    } catch (err) {
      console.log('reducer2 err', err);
      throw err;
    }

    const [state2, dispatch] = reducer2Res;

    console.log('Test render after useReducer2', state2);

    const [optimisticState, addOptimistic] = React.useOptimistic(
      state,
      (state, action: number) => {
        console.log('optimistic reducer', state, action);
        return state + action;
      }
    );
    const [isPending1, startTransition1] = useTransition();
    const [isPending2, startTransition2] = useTransition();

    async function test1() {
      React.startTransition(async () => {
        console.log('transition_g1 start');
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('transition_g1 addOptimistic');
        addOptimistic(1);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setState(1);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addOptimistic(2);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addOptimistic(2);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setState1(1);
        console.log('transition_g1 end');
      });

      await new Promise((resolve) => setTimeout(resolve, 1400));

      React.startTransition(async () => {
        console.log('transition_g2 start');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('transition_g2 end');
      });

      startTransition1(async () => {
        console.log('transition1 start');
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('transition1 end');
      });

      startTransition2(async () => {
        console.log('transition2 start');
        await new Promise((resolve) => setTimeout(resolve, 5500));
        console.log('transition2 end');
      });
    }

    async function test2() {
      React.startTransition(async () => {
        console.log('transition_g1 start');
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('transition_g1 addOptimistic');
        addOptimistic(1);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('transition_g1 end');
      });
    }

    async function test3() {
      addOptimistic(1);
      React.startTransition(async () => {
        console.log('transition_g1 start');
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('transition_g1 addOptimistic');
        addOptimistic(1);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setState(1);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addOptimistic(2);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addOptimistic(2);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setState1(1);
        console.log('transition_g1 end');
      });
    }

    async function test4() {
      React.startTransition(() => {
        throw new Error('Oops');
      });
    }

    async function test5() {
      startTransition1(async () => {
        setState1(2);
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
          }, 500)
        );
        setState1(1);

        await new Promise((resolve) => setTimeout(resolve, 500));
      });

      // setState1(3);
    }

    async function test6() {
      React.startTransition(async () => {
        // await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('dispatch(1)');
        dispatch(1);
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
          }, 500)
        );
        console.log('dispatch(2)');
        dispatch(2);

        // setTimeout(() => {
        //   dispatch(3);
        // }, 100);

        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('startTransition1 end');
      });

      // setTimeout(() => {
      //   console.log('dispatch(3)');
      //   dispatch(3);
      // }, 100);

      setTimeout(() => {
        console.log('dispatch(4)');
        dispatch(4);
      }, 2000);
    }

    console.log('Test render', {
      state,
      state1,
      state2,
      optimisticState,
      isPending1,
      isPending2,
    });

    return (
      <>
        <button onClick={test1}>test1</button>
        <button onClick={test2}>test2</button>
        <button onClick={test3}>test3</button>
        <button onClick={test4}>test4</button>
        <button onClick={test5}>test5</button>
        <button onClick={test6}>test6</button>
      </>
    );
  }

  const container = getContainer();
  const root = ReactDOMClient.createRoot(container);
  root.render(<Test />);
}

async function testUseTransition() {
  const container = getContainer();
  const root = ReactDOMClient.createRoot(container);
  let i = 0;
  function Test() {
    const [count, setCount] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [isPending2, startTransition2] = useTransition();

    console.log(
      'render isPending',
      isPending,
      'count',
      count,
      'isPending2',
      isPending2
    );

    function test1() {
      startTransition(async () => {
        console.log('startTransition action');
        await new Promise((resolve) => setTimeout(resolve, 500));
        startTransition(async () => {
          console.log('startTransition1 action');
          await new Promise((resolve) => setTimeout(resolve, 2500));
          setCount(++i);
          console.log('startTransition1 action end');
        });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setCount(++i);
        console.log('startTransition action end');
      });
    }

    function test2() {
      startTransition(() => {
        console.log('startTransition action');
        startTransition(() => {
          console.log('startTransition1 action');
          setCount(++i);
          console.log('startTransition1 action end');
        });
        setCount(++i);
        console.log('startTransition action end');
      });
    }

    function test3() {
      startTransition(async () => {
        console.log('startTransition action');
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCount(++i);
        console.log('startTransition action end');
      });

      startTransition2(async () => {
        console.log('startTransition2 action');
        await new Promise((resolve) => setTimeout(resolve, 2500));
        setCount(++i);
        console.log('startTransition2 action end');
      });

      React.startTransition(async () => {
        console.log('startTransition_g1 action');
        await new Promise((resolve) => setTimeout(resolve, 4500));
        setCount(++i);
        console.log('startTransition_g1 action end');
      });
    }

    return (
      <div>
        isPending: {isPending}
        count: {count}
        <button onClick={test1}>test1</button>
        <button onClick={test2}>test2</button>
        <button onClick={test3}>test3</button>
      </div>
    );
  }

  root.render(<Test />);
}

async function testUseDeferredValue() {
  const container = getContainer();
  const root = ReactDOMClient.createRoot(container);
  function Test() {
    const [count, setCount] = useState(0);
    const value = React.useDeferredValue(count, -1);

    console.log('render value', value, 'count', count);
    if (value !== count) {
      console.time('xxx');
    } else {
      console.timeEnd('xxx');
    }
    return (
      <div>
        count: {count} value: {value}
        <button
          onClick={() => {
            if (count > 3) {
              setCount(undefined);
            } else {
              setCount((count ?? 0) + 1);
            }
          }}
        >
          test
        </button>
      </div>
    );
  }

  root.render(<Test />);
}

async function test1() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });

  let dispatch;
  let dispatch1;
  function App() {
    console.log('App render start');
    const [state, _dispatch] = useReducer((state, action) => {
      console.log('reducer', state, action);

      if (action === 2) {
        dispatch(3);
      }
      return state + action;
    }, 0);
    dispatch = _dispatch;

    console.log('App render state', state);

    console.log('useId', useId(), useId());

    if (state >= 3) {
      console.log('App render use');
      try {
        use(promise);
      } catch (err) {
        console.log('App render use error', err);
        throw err;
      }
    }

    const [state1, _dispatch1] = useReducer((state, action) => {
      console.log('reducer1', state, action);
      return state + action;
    }, 0);
    dispatch1 = _dispatch1;

    console.log('App render state1', state1);

    return (
      <div>
        {state} {state1}
      </div>
    );
  }

  const container = getContainer();
  const root = ReactDOMClient.createRoot(container);
  root.render(<App />);

  // await new Promise((resolve) => setTimeout(resolve, 500));

  // dispatch(1);
  // dispatch(2);
  // dispatch1(1);
  // dispatch1(2);

  // await new Promise((resolve) => setTimeout(resolve, 500));

  // resolve();

  // await new Promise((resolve) => setTimeout(resolve, 500));
}

async function test2() {
  function createThenable() {
    let completed = false;
    let resolve;
    const promise = new Promise((res) => {
      resolve = () => {
        completed = true;
        res();
      };
    });
    const PromiseComp = () => {
      if (!completed) {
        throw promise;
      }
      return 'Done';
    };
    return { promise, resolve, PromiseComp };
  }

  const {
    promise: promise1,
    resolve: resolve1,
    PromiseComp: PromiseComp1,
  } = createThenable();
  const {
    promise: promise2,
    resolve: resolve2,
    PromiseComp: PromiseComp2,
  } = createThenable();

  let ops = [];
  const suspenseCallback1 = (thenables) => {
    ops.push(thenables);
  };

  const element = (
    <React.Suspense
      suspenseCallback={suspenseCallback1}
      fallback={'Waiting Tier 1'}
    >
      <PromiseComp1 />
      <PromiseComp2 />
    </React.Suspense>
  );

  ReactNoop.render(element);
  // expect(Scheduler).toFlushWithoutYielding();
  // expect(ReactNoop.getChildren()).toEqual([text('Waiting Tier 1')]);
  // expect(ops).toEqual([new Set([promise1, promise2])]);
  ops = [];

  await resolve1();
  ReactNoop.render(element);
  // expect(Scheduler).toFlushWithoutYielding();
  // expect(ReactNoop.getChildren()).toEqual([text('Waiting Tier 1')]);
  // expect(ops).toEqual([new Set([promise2])]);

  ops = [];

  await new Promise((resolve) => setTimeout(resolve, 1500));

  await resolve2();
  ReactNoop.render(element);
  // expect(Scheduler).toFlushWithoutYielding();
  // await new Promise((resolve) => setTimeout(resolve, 500));
  // console.log('xxx', ReactNoop.getChildren());
  // expect(ReactNoop.getChildren()).toEqual([text('Done'), text('Done')]);
  // expect(ops).toEqual([]);
}

async function testChangeEvent() {
  const container = getContainer();
  const root = ReactDOMClient.createRoot(container);
  let inputEvent: any;
  root.render(
    <input
      style={{ width: 200, height: 50, backgroundColor: '#ddd' }}
      onChange={(e) => {
        console.log('onChange', e);
        console.log(
          'onChange inputEvent.nativeEvent === e.nativeEvent',
          inputEvent.nativeEvent === e.nativeEvent
        );
      }}
      onChangeCapture={(e) => {
        console.log('onChangeCapture', e);
        Promise.resolve().then(() => {
          console.log('onChangeCapture promise');
        });
      }}
      onInput={(e) => {
        console.log('onInput', e);
        inputEvent = e;
        Promise.resolve().then(() => {
          console.log('onInput promise');
        });
        setTimeout(() => {
          console.log('onInput timeout');
        });

        throw new Error('onInput error');
      }}
      onInputCapture={(e) => {
        console.log('onInputCapture', e);
        inputEvent = e;
        Promise.resolve().then(() => {
          console.log('onInputCapture promise');
        });
        setTimeout(() => {
          console.log('onInputCapture timeout');
        });

        throw new Error('onInputCapture error');
      }}
    />
  );
}

async function testLifeCycle() {
  const {
    createLogFun,
    createLifecycleTestClassComponent,
    createLifecycleTestFunctionComponent,
  } = await import(
    '../../../packages/vuact-dom/src/__tests__/lifecycle-test-component'
  );

  async function testClassComponentClientRender() {
    console.log('testClassComponentClientRender');
    async function testLifeCycleTestClassComponent({
      React,
      ReactDOMClient,
      TestComponent,
      log,
    }: any) {
      const container = document.createElement('div');
      const root = ReactDOMClient.createRoot(container);
      let rootInstance: any;
      log('root', 'before render');
      root.render(
        React.createElement(TestComponent, {
          ref: (ref) => {
            rootInstance = ref;
          },
          tag: 'L0',
        })
      );
      log('root', {
        msg: 'after render',
        nextTick: false,
      });

      await waitRender();

      log('----', '----');
      rootInstance.update({
        count: 1,
      });

      await waitRender();

      log('root', 'before unmount');
      root.unmount();
      log('root', 'after unmount');

      await waitRender();
    }

    const reactLog = createLogFun();
    const vuactLog = createLogFun();

    const newApi = true;

    await Promise.all([
      testLifeCycleTestClassComponent({
        React: _React,
        ReactDOM: _ReactDOM,
        ReactDOMClient: _ReactDOMClient,
        TestComponent: createLifecycleTestClassComponent({
          React: _React,
          newApi,
          log: reactLog,
        }),
        log: reactLog,
      }),
      testLifeCycleTestClassComponent({
        React: Vuact,
        ReactDOM: VuactDOM,
        ReactDOMClient: VuactDOMClient,
        TestComponent: createLifecycleTestClassComponent({
          React: Vuact as any,
          newApi,
          log: vuactLog,
        }),
        log: vuactLog,
      }),
    ]);

    expect(vuactLog.logs).toEqual(reactLog.logs);
  }

  async function testClassComponentLegacyRender() {
    console.log('test1_2');
    async function testLifeCycleTestClassComponent({
      React,
      ReactDOM,
      ReactDOMClient,
      TestComponent,
      log,
    }: any) {
      const container = document.createElement('div');
      let rootInstance: any;
      log('root', 'before render');
      ReactDOM.render(
        React.createElement(TestComponent, {
          ref: (ref) => {
            rootInstance = ref;
          },
          tag: 'L0',
        }),
        container
      );
      log('root', 'after render');

      await waitRender();

      log('----', '----');
      rootInstance.update({
        count: 1,
      });

      await waitRender();

      log('root', 'before unmount');
      ReactDOM.unmountComponentAtNode(container);
      log('root', 'after unmount');

      await waitRender();
    }

    const reactLog = createLogFun();
    const vuactLog = createLogFun();

    await Promise.all([
      testLifeCycleTestClassComponent({
        React: _React,
        ReactDOM: _ReactDOM,
        ReactDOMClient: _ReactDOMClient,
        TestComponent: createLifecycleTestClassComponent({
          React: _React,
          log: reactLog,
        }),
        log: reactLog,
      }),
      testLifeCycleTestClassComponent({
        React: Vuact,
        ReactDOM: VuactDOM,
        ReactDOMClient: VuactDOMClient,
        TestComponent: createLifecycleTestClassComponent({
          React: Vuact as any,
          log: vuactLog,
        }),
        log: vuactLog,
      }),
    ]);

    expect(vuactLog.logs).toEqual(reactLog.logs);
  }

  async function testFunctionComponentClientRender() {
    async function testLifeCycleTestFunctionComponent({
      React,
      ReactDOM,
      ReactDOMClient,
      TestComponent,
      log,
    }: any) {
      const container = document.createElement('div');
      const root = ReactDOMClient.createRoot(container);
      let rootInstance: any;
      log('root', 'before render');
      root.render(
        React.createElement(TestComponent, {
          ref: (ref) => {
            rootInstance = ref;
          },
          customRef: (ref) => {
            rootInstance = ref;
          },
          tag: 'L0',
        })
      );
      log('root', 'after render');

      await waitRender();

      log('----', '----');
      rootInstance.update({
        count: 1,
      });

      await waitRender();

      log('----', '----');
      rootInstance.dispatch({
        count: 1,
      });

      await waitRender();

      log('root', 'before unmount');
      root.unmount();
      log('root', 'after unmount');

      await waitRender();
    }

    const reactLog = createLogFun();
    const vuactLog = createLogFun();

    const depth = 2;
    await Promise.all([
      testLifeCycleTestFunctionComponent({
        React: _React,
        ReactDOM: _ReactDOM,
        ReactDOMClient: _ReactDOMClient,
        TestComponent: createLifecycleTestFunctionComponent({
          React: _React,
          log: reactLog,
          depth,
        }),
        log: reactLog,
      }),
      testLifeCycleTestFunctionComponent({
        React: Vuact,
        ReactDOM: VuactDOM,
        ReactDOMClient: VuactDOMClient,
        TestComponent: createLifecycleTestFunctionComponent({
          React: Vuact as any,
          log: vuactLog,
          depth,
        }),
        log: vuactLog,
      }),
    ]);

    expect(vuactLog.logs).toEqual(reactLog.logs);
  }

  async function testFunctionComponentLegacyRender() {
    async function testLifeCycleFunctionClassComponent({
      React,
      ReactDOM,
      ReactDOMClient,
      TestComponent,
      log,
    }: any) {
      const container = document.createElement('div');
      let rootInstance: any;
      log('root', 'before render');
      ReactDOM.render(
        React.createElement(TestComponent, {
          ref: (ref) => {
            rootInstance = ref;
          },
          customRef: (ref) => {
            rootInstance = ref;
          },
          tag: 'L0',
        }),
        container
      );
      log('root', 'after render');

      await waitRender();

      log('----', '----');
      rootInstance.update({
        count: 1,
      });

      await waitRender();

      log('----', '----');
      rootInstance.dispatch({
        count: 1,
      });

      await waitRender();

      log('root', 'before unmount');
      ReactDOM.unmountComponentAtNode(container);
      log('root', 'after unmount');

      await waitRender();
    }

    const reactLog = createLogFun();
    const vuactLog = createLogFun();

    await Promise.all([
      testLifeCycleFunctionClassComponent({
        React: _React,
        ReactDOM: _ReactDOM,
        ReactDOMClient: _ReactDOMClient,
        TestComponent: createLifecycleTestFunctionComponent({
          React: _React,
          log: reactLog,
        }),
        log: reactLog,
      }),
      testLifeCycleFunctionClassComponent({
        React: Vuact,
        ReactDOM: VuactDOM,
        ReactDOMClient: VuactDOMClient,
        TestComponent: createLifecycleTestFunctionComponent({
          React: Vuact as any,
          log: vuactLog,
        }),
        log: vuactLog,
      }),
    ]);

    expect(vuactLog.logs).toEqual(reactLog.logs);
  }

  testClassComponentClientRender();
  // testFunctionComponentClientRender();
  // test1_3();
}

async function testErrorBoundary() {
  const { createLogFun, createLifecycleTestFunctionComponent } = await import(
    '../../../packages/vuact-dom/src/__tests__/lifecycle-test-component'
  );
  const log = createLogFun();
  const TestComponent = createLifecycleTestFunctionComponent({
    React,
    log,
  });

  class ErrorBoundary extends React.Component {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
      console.log('ErrorBoundary componentDidCatch', error, errorInfo);
    }

    render() {
      return this.props.children;
    }
  }

  function waitRender() {
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  const container = document.createElement('div');
  const root = ReactDOMClient.createRoot(container);
  let rootInstance: any;
  log('root', 'before render');
  root.render(
    React.createElement(
      ErrorBoundary,
      {},
      React.createElement(TestComponent, {
        ref: (ref) => {
          rootInstance = ref;
        },
        customRef: (ref) => {
          rootInstance = ref;
        },
        errorKey: 'useLayoutEffect cleanup',
      })
    )
  );
  log('root', 'after render');

  await waitRender();

  log('----', '----');
  rootInstance.update({
    count: 1,
  });

  await waitRender();
}

async function testRefDestory() {
  const container = getContainer();
  let textRef;

  function Test({ aaa }) {
    textRef = useRef(null);
    return (
      <div>
        {aaa ? <span>img</span> : null}
        {!aaa && <span ref={textRef}>text</span>}
      </div>
    );
  }

  ReactDOM.render(<Test aaa={false} />, container);
  ReactDOM.render(<Test aaa={true} />, container);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  expect(textRef.current).toBe(null);
}

function expect(a: any) {
  if (typeof a === 'function') {
    a = a();
  }
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (
          prop === 'toHaveYielded' ||
          prop === 'toFlushAndYield' ||
          prop === 'toFlushWithoutYielding'
        ) {
          return (e) => {
            if (prop === 'toFlushAndYield') {
              flushAll();
            }
            console.log('expect', a.unstable_clearYields(), prop, e);
          };
        }
        return (e) => {
          console.log('expect', a, prop, e);
        };
      },
    }
  );
}

function toggleVuact() {
  localStorage.setItem('useVuact', useVuact ? 'false' : 'true');
  location.reload();
}
</script>

<template>
  <div>
    <div style="padding: 10px">
      <div>vuact temp test</div>
      <button @click="toggleVuact">{{ useVuact ? 'Vuact' : 'React' }}</button>
    </div>

    <div style="display: flex; gap: 8px; margin-bottom: 20px">
      <button @click="test">test</button>
      <button @click="test1">test1</button>
      <button @click="test2">test2</button>
      <button @click="testTransitionSuspense">testTransitionSuspense</button>
      <button @click="testUseActionState">testUseActionState</button>
      <button @click="testStartTransition">testStartTransition</button>
      <button @click="testUseTransition">testUseTransition</button>
      <button @click="testLifeCycle">testLifeCycle</button>
      <button @click="testErrorBoundary">testErrorBoundary</button>
      <button @click="testChangeEvent">testChangeEvent</button>
      <button @click="testRefDestory">testRefDestory</button>
    </div>

    <div id="test-container" />
  </div>
</template>
