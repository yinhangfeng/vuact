import { describe, it, expect } from 'vitest';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as Vuact from 'vuact';
import * as VuactDOM from 'vuact-dom';
import * as VuactDOMClient from 'vuact-dom/client';
import {
  createLogFun,
  createLifecycleTestClassComponent,
  createLifecycleTestFunctionComponent,
} from './lifecycle-test-component';

function waitRender() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}

function filterLog(logs: any[][], ignoreLogs: any[][]) {
  return logs.filter((it) => {
    for (const ignoreLog of ignoreLogs) {
      if (it.length === ignoreLog.length) {
        let match = true;
        for (let i = 0; i < it.length; i++) {
          if (it[i] !== ignoreLog[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          return false;
        }
      }
    }
    return true;
  });
}

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
    nextTick: !__VUACT_SKIP_TEST__,
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

describe('lifecycle-test', () => {
  it('test class component client root lifecycle', async () => {
    const reactLog = createLogFun();
    const vuactLog = createLogFun();

    await Promise.all([
      testLifeCycleTestClassComponent({
        React,
        ReactDOM,
        ReactDOMClient,
        TestComponent: createLifecycleTestClassComponent({
          React,
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

    const ignoreLogs = [];
    // let start = 0;
    // let end = 500;
    // vuactLog.logs = vuactLog.logs.slice(start, end)
    // reactLog.logs = reactLog.logs.slice(start, end)
    // console.log(vuactLog.logs[0])
    // console.log('\n\n')
    // console.log(reactLog.logs[0])

    expect(filterLog(vuactLog.logs, ignoreLogs)).toEqual(
      filterLog(reactLog.logs, ignoreLogs)
    );
  });

  it('test class component new api client root lifecycle', async () => {
    const reactLog = createLogFun();
    const vuactLog = createLogFun();

    await Promise.all([
      testLifeCycleTestClassComponent({
        React,
        ReactDOM,
        ReactDOMClient,
        TestComponent: createLifecycleTestClassComponent({
          React,
          newApi: true,
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
          newApi: true,
          log: vuactLog,
        }),
        log: vuactLog,
      }),
    ]);

    const ignoreLogs = [];

    expect(
      filterLog(vuactLog.logs, ignoreLogs).filter(
        // react 会先地柜渲染在批量 commit， getSnapshotBeforeUpdate 在 commit 之前执行
        // 而 vue 是边递归渲染边修改 dom，无法实现与 react 一致的 getSnapshotBeforeUpdate 调用时机
        (it) => !it.includes('getSnapshotBeforeUpdate')
      )
    ).toEqual(
      filterLog(reactLog.logs, ignoreLogs).filter(
        (it) => !it.includes('getSnapshotBeforeUpdate')
      )
    );
  });

  // vuact 不支持同步 setState
  it.skip('test class component legacy dom render lifecycle', async () => {
    async function testLifeCycleTestClassComponent({
      React,
      ReactDOM,
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
        React,
        ReactDOM,
        ReactDOMClient,
        TestComponent: createLifecycleTestClassComponent({
          React,
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
  });

  it.skipIf(
    __VUACT_SKIP_TEST__,
    'test function component client root lifecycle',
    async () => {
      async function testLifeCycleTestFunctionComponent({
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
            customRef: (ref) => {
              rootInstance = ref;
            },
            tag: 'L0',
          })
        );
        log('root', {
          msg: 'after render',
          nextTick: !__VUACT_SKIP_TEST__,
        });

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

        // log('root', 'before unmount');
        // root.unmount();
        // log('root', 'after unmount');

        await waitRender();
      }

      const reactLog = createLogFun();
      const vuactLog = createLogFun();

      const depth = 2;
      await Promise.all([
        testLifeCycleTestFunctionComponent({
          React,
          ReactDOM,
          ReactDOMClient,
          TestComponent: createLifecycleTestFunctionComponent({
            React,
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

      const ignoreLogs = [
        // vuact root.render 和 setState 之后会在 nextTick 执行，而 react 会在 setTimeout 执行，所以下面的 __NEXT_TICK__ log 顺序不一致
        ['__NEXT_TICK__', 'root', 'after render'],
        ['__NEXT_TICK__', 'L0', 'update after setState'],
      ];

      expect(filterLog(vuactLog.logs, ignoreLogs)).toEqual(
        filterLog(reactLog.logs, ignoreLogs)
      );
    }
  );

  it.skip('test function component legacy dom render lifecycle', async () => {
    async function testLifeCycleFunctionClassComponent({
      React,
      ReactDOM,
      TestComponent,
      log,
    }: any) {
      const container = document.createElement('div');
      let rootInstance: any;
      log('root', 'before render');
      ReactDOM.render(
        React.createElement(TestComponent, {
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
        React,
        ReactDOM,
        ReactDOMClient,
        TestComponent: createLifecycleTestFunctionComponent({
          React,
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
  });
});
