import type React from 'react';
import { REACT_PROFILER_TYPE } from './symbols';

// TODO
function Profiler(props: any) {
  return props.children;
}

Profiler.$$typeof = REACT_PROFILER_TYPE;

const ReactProfiler = Profiler as typeof React.Profiler;

export { ReactProfiler as Profiler };
