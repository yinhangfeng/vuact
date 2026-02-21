import type { ReactElement } from 'react';
import { createRoot, unstable_batchedUpdates } from 'vuact-dom';
import { act, flushAll } from 'vuact';
// import * as Scheduler from 'scheduler/unstable_mock';
import ReactVersion from 'vuact-shared/src/ReactVersion';

type TestRendererOptions = {
  createNodeMock: (element: ReactElement<any>) => any;
  unstable_isConcurrent: boolean;
  unstable_strictMode: boolean;
};

function create(element: ReactElement<any>, options: TestRendererOptions) {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(element);
  flushAll();
  flushAll();

  const entry = {
    root,
    toJSON() {},
    toTree() {},
    update(newElement: ReactElement<any>) {
      root.render(newElement);
      flushAll();
    },
    unmount() {
      root.unmount();
    },
    getInstance() {},

    unstable_flushSync: () => {},
  };

  return entry;
}

export {
  // Scheduler as _Scheduler,
  create,
  unstable_batchedUpdates,
  act,
  ReactVersion as version,
};
