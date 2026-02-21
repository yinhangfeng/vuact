import React, { Suspense, lazy } from 'react';
import ReactSuspenseTestComp2 from './components/react-suspense-test-comp2';
import ErrorBoundary from './components/error-boundary';

const LazyReactSuspenseTestComp1 = lazy(async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // Suspense 对于 lazy 加载失败的场景，会直接抛出错误，不会走到 fallback 逻辑
  // throw new Error('LazyReactSuspenseTestComp1 error');
  return import('./components/react-suspense-test-comp1');
});

export default function ReactSuspenseTest() {
  return (
    <ErrorBoundary>
      {/* <LazyReactSuspenseTestComp1 /> */}
      <Suspense fallback={<div>Suspense fallback</div>}>
        <div>ReactSuspenseTest</div>
        <LazyReactSuspenseTestComp1 />
        {/* <ReactSuspenseTestComp2 /> */}
      </Suspense>
    </ErrorBoundary>
  );
}
