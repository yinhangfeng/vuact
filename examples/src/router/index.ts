import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';
import { r2v } from 'vuact';
import { createVNode } from 'vue';

const exampleModules = import.meta.glob(['../examples/**/*example.*']);
export const exampleCodes: Record<string, { default: string }> =
  import.meta.glob(['../examples/**/*'], {
    query: 'raw',
    eager: true,
  });

const nameFromPath = (path: string) =>
  path.replace(/^.*\/examples\/(.+)$/, '$1');

const routeMap: Record<string, RouteRecordRaw> = {};
Object.keys(exampleModules).forEach((filepath) => {
  const name = nameFromPath(filepath);
  const index = name.indexOf('/');
  const parentPath = name.slice(0, index);
  const path = name.slice(index + 1);

  const replParentPath = `repl/${parentPath}`;
  let replParentRoute = routeMap[replParentPath];
  if (!replParentRoute) {
    replParentRoute = {
      name: replParentPath,
      path: replParentPath,
      children: [],
    };
    routeMap[replParentPath] = replParentRoute;
  }

  let parentRoute = routeMap[parentPath];
  if (!parentRoute) {
    parentRoute = {
      name: parentPath,
      path: parentPath,
      children: [],
    };
    routeMap[parentPath] = parentRoute;
  }

  parentRoute.children!.push({
    name,
    path,
    component: async () => {
      const { default: component } = (await exampleModules[filepath]()) as any;
      return {
        // function 认为是 react 组件
        default: typeof component === 'function' ? r2v(component) : component,
      };
    },
    meta: {
      filepath,
    },
  });

  const replName = `repl/${name}`;
  replParentRoute.children!.push({
    name: replName,
    path: path,
    component: async () => {
      const Repl = (await import('../components/repl')).default;
      return {
        default: createVNode(Repl, { key: replName }),
      };
    },
    meta: {
      filepath,
    },
  });
});

export const routes = [
  {
    path: '/',
    redirect: {
      name: 'repl/r2v/basic/example.vue',
    },
    children: Object.values(routeMap),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
