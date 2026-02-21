import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { router } from './router';

const concurrentMode = localStorage.getItem('react_concurrent_mode');

export default function ReactApp() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '8px', padding: '12px' }}>
        {router.routes[0].children?.map((route) => {
          return (
            <Link key={route.path} to={route.path}>
              {route.path}
            </Link>
          );
        })}
        <button
          onClick={() => {
            if (concurrentMode === 'true') {
              localStorage.setItem('react_concurrent_mode', 'false');
            } else {
              localStorage.setItem('react_concurrent_mode', 'true');
            }
            location.reload();
          }}
        >
          concurrent mode ({concurrentMode})
        </button>
      </nav>
      <Outlet />
    </div>
  );
}
