import { resolve } from 'path';
import { builtinModules } from 'module';
import dts from 'vite-plugin-dts';
import { mergeConfig } from 'vite';
import type { UserConfig, UserConfigExport, ConfigEnv } from 'vite';
import { getPackageJson, getPackageRoot } from '../utils';

// https://github.com/element-plus/element-plus/blob/682553a27eae74ea45416ed015007a785db511bc/internal/build/src/utils/rollup.ts
export function generateExternal({
  projectPackage,
  nodejs = false,
  umd = false,
}: {
  projectPackage: any;
  nodejs?: boolean;
  umd?: boolean;
}) {
  const dependencies = Object.keys(projectPackage.dependencies ?? {});
  const peerDependencies = Object.keys(projectPackage.peerDependencies ?? {});
  const modules = [...peerDependencies];
  if (!umd) {
    modules.push(...dependencies);
  }
  if (nodejs) {
    modules.push(...builtinModules);
    modules.push(...builtinModules.map((it) => `node:${it}`));
  }
  const modulesSet = new Set(modules);
  return (id: string) => {
    let result = modulesSet.has(id);
    if (!result) {
      for (const pkg of modulesSet) {
        if (id.startsWith(`${pkg}/`)) {
          result = true;
          break;
        }
      }
    }
    return result;
  };
}

export interface LibUserConfig extends UserConfig {
  nodejs?: boolean;
}

export function defineLibConfig(
  config:
    | LibUserConfig
    | Promise<LibUserConfig>
    | ((env: ConfigEnv) => LibUserConfig | Promise<LibUserConfig>)
): UserConfigExport {
  return async (env: ConfigEnv) => {
    if (typeof config === 'function') {
      config = await config(env);
    } else {
      config = await config;
    }

    const packageRoot = getPackageRoot(config);
    const projectPackage = getPackageJson(packageRoot);

    config = mergeConfig(
      {
        mode: 'production',
        build: {
          target: 'es2019',
          outDir: 'dist',
          lib: {
            entry: {
              index: './src/index.ts',
            },
            formats: ['es'],
            fileName: '[name]',
          },
          rollupOptions: {
            external: generateExternal({
              projectPackage,
              nodejs: config.nodejs,
            }),
          },
          minify: false,
          emptyOutDir: true,
        },
        define: {
          __DEV__: false,
          __PACKAGE_VERSION__: JSON.stringify(projectPackage.version),
        },
      } as UserConfig,
      config
    );

    config.plugins = [
      ...(config.plugins ?? []),
      // https://github.com/qmhc/vite-plugin-dts
      dts({
        // 配置 packageRoot/src 为 d.ts 输出的相对根目录，如果不配置且依赖了当前 workspace 的未编译的其它包
        // 会导致输出 packages/xxx/src/index.d.ts 的结构
        entryRoot: resolve(packageRoot, 'src'),
      }),
    ];

    return config;
  };
}
