<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { globalConfig } from 'vuact';

const router = useRouter();

const pages = router
  .getRoutes()
  .filter((route) => !route.meta.hide)
  .map((route) => ({ name: route.name }));

function toggleVuactRendererEnabled() {
  localStorage.setItem(
    'vuactRendererEnabled',
    globalConfig.vuactRendererEnabled ? 'false' : 'true'
  );
  location.reload();
}
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.sider">
      <h2>Playground</h2>
      <button @click="toggleVuactRendererEnabled">
        vuactRenderer {{ globalConfig.vuactRendererEnabled }}
      </button>
      <template v-for="page in pages" :key="page.name">
        <router-link v-slot="{ route }" :to="page">
          {{ route.name }}
        </router-link>
      </template>
    </div>
    <div :class="$style.main">
      <router-view />
    </div>
  </div>
</template>

<style lang="less" module>
.container {
  width: 100%;
  height: 100%;
  display: flex;
}

.sider {
  width: 240px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-right: 1px solid #ddd;
}

.main {
  height: 100%;
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 20px;
}
</style>
