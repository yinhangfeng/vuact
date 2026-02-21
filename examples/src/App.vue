<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { globalConfig } from 'vuact';
import { routes } from './router';

const rootRoute = routes[0];

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
      <h3>Examples</h3>
      <button @click="toggleVuactRendererEnabled">
        vuactRenderer {{ globalConfig.vuactRendererEnabled }}
      </button>
      <div
        v-for="groupRoute in rootRoute.children"
        :key="groupRoute.name"
        :class="$style.linkGroup"
      >
        <div :class="$style.linkGroupTitle">
          {{ groupRoute.name }}
        </div>
        <RouterLink
          v-for="route in groupRoute.children"
          :key="route.name"
          :class="$style.link"
          :to="{ name: route.name }"
        >
          {{ route.path }}
        </RouterLink>
      </div>
    </div>
    <div :class="$style.main">
      <RouterView />
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
}

.linkGroupTitle {
  font-size: 16px;
  font-weight: bold;
}

.linkGroup {
  display: flex;
  flex-direction: column;
}

.link {
  font-size: 15px;
  &:global(.router-link-active) {
    background-color: #ddd;
    font-weight: bold;
  }
}
</style>
