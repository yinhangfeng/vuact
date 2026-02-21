import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { kebabCase } from 'lodash-es';
import Layout from './layout';

const viewModules = import.meta.glob('./views/*.tsx');

const nameFromPath = (path: string) => path.replace(/^.*\/([^/]+)\.tsx$/, '$1');

export const router = createBrowserRouter([
  {
    path: '/react',
    element: <Layout />,
    children: Object.keys(viewModules).map((path) => {
      const name = nameFromPath(path);
      const Comp = lazy(viewModules[path]);
      return {
        path: name === '404' ? ':patchMatch(.*)*' : kebabCase(name),
        element: <Comp />,
      };
    }),
  },
]);
