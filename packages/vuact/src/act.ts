import type React from 'react';
import { flushAll } from './scheduler';

export const act: typeof React.act = function act(callback: any): any {
  if (!__TEST_SCHEDULER__) {
    return;
  }
  flushAll();

  const result = callback();

  flushAll();
  flushAll();

  return {
    then(resolve: any) {
      setTimeout(() => {
        resolve(result);
      }, 30);
    },
  };
};
