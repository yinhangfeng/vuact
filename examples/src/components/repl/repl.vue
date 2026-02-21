<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Repl, useStore, File } from '@vue/repl';
import Monaco from '@vue/repl/monaco-editor';
import { useRoute } from 'vue-router';
import { exampleCodes } from '../../router';
import { builtinModules } from './modules';

const route = useRoute();
const mainFile = ref('src/main.vue');
const appFile = ref('');
const activeFilename = ref('');
const mainFileCode = computed(() => {
  return `<script setup lang="ts">
import { r2v } from 'vuact';
import App from './${appFile.value}';

const Main = typeof App === 'function' ? r2v(App) : App;
<\/script>
<template>
  <Main />
</template>
`;
});
const files = ref<Record<string, File>>({});
watch(
  () => route.meta.filepath as string,
  (mainFilepath) => {
    const dir = `${mainFilepath.split('/').slice(0, -1).join('/')}/`;
    for (const key in exampleCodes) {
      if (key.startsWith(dir)) {
        const filepath = `src/${key.slice(dir.length)}`;
        const code = exampleCodes[key].default;
        files.value[filepath] = new File(filepath, code);
      }
    }
    appFile.value = mainFilepath.slice(dir.length);
    activeFilename.value = `src/${appFile.value}`;
  },
  {
    immediate: true,
  }
);

// watch(
//   files,
//   (v) => {
//     console.log('files changed', v['src/example.vue'].code);
//   },
//   {
//     deep: true,
//     flush: 'sync',
//   }
// );

const store = useStore(
  {
    files,
    mainFile,
    // activeFilename,
    template: ref({
      welcomeSFC: mainFileCode,
    }),
    showOutput: ref(true),
    builtinImportMap: ref({
      imports: builtinModules,
    }),
  }
  // location.hash
);

setTimeout(() => {
  store.setActive(activeFilename.value);
}, 50);

// watchEffect(() => history.replaceState({}, '', store.serialize()));

const previewOptions = {
  headHTML: `<script>
  window.__TEST_SCHEDULER__ = false;
<\/script>`,
};
</script>

<template>
  <Repl
    :store="store"
    :editor="Monaco"
    :showCompileOutput="true"
    :previewOptions="previewOptions"
    :clearConsole="false"
  />
</template>
