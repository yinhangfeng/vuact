import React from 'react';

const promise: any = new Promise((resolve) => {
  setTimeout(() => {
    promise.__status = 'resolved';
    resolve(null);
  }, 3000);
});

export default function ReactSuspenseTestComp2() {
  console.log('ReactSuspenseTestComp2 render');
  // throw new Error('ReactSuspenseTestComp2 error');

  if (promise.__status !== 'resolved') {
    // Suspense 会捕获 throw 的 promise
    throw promise;
  }

  return <div>ReactSuspenseTestComp2</div>;
}
