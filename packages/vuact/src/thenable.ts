import { EMPTY_FUNC } from './constants';

export type Thenable<T> = PromiseLike<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
};

export function isThenable(val: unknown): val is Thenable<any> {
  return typeof val === 'object' && typeof (val as any).then === 'function';
}

export function resolveThenable<T>(thenable: Thenable<T>): T {
  switch (thenable.status) {
    case 'fulfilled': {
      return thenable.value!;
    }
    case 'rejected': {
      throw thenable.reason;
    }
    default: {
      if (typeof thenable.status === 'string') {
        // Only instrument the thenable if the status if not defined. If
        // it's defined, but an unknown value, assume it's been instrumented by
        // some custom userspace implementation. We treat it as "pending".
        // Attach a dummy listener, to ensure that any lazy initialization can
        // happen. Flight lazily parses JSON when the value is actually awaited.
        thenable.then(EMPTY_FUNC, EMPTY_FUNC);
      } else {
        thenable.status = 'pending';
        thenable.then(
          (fulfilledValue) => {
            if (thenable.status === 'pending') {
              thenable.status = 'fulfilled';
              thenable.value = fulfilledValue;
            }
          },
          (error: any) => {
            if (thenable.status === 'pending') {
              thenable.status = 'rejected';
              thenable.reason = error;
            }
          }
        );
      }

      // Check one more time in case the thenable resolved synchronously.
      switch (thenable.status) {
        case 'fulfilled': {
          return thenable.value!;
        }
        case 'rejected': {
          throw thenable.reason;
        }
      }
    }
  }
  throw thenable;
}
