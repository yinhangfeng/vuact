import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './react/router';

export default function ReactApp() {
  return (
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  );
}
