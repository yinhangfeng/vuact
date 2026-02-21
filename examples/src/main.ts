import { setupRenderer } from 'vuact';
import 'vuact/setup-scheduler';
import { createApp } from 'vue';
import router from './router';
import App from './App.vue';

if (localStorage.getItem('vuactRendererEnabled') !== 'false') {
  setupRenderer();
}

const app = createApp(App);
app.use(router);
app.mount('#app');
