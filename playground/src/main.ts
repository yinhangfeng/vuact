import './assets/main.css';
import { setupRenderer } from 'vuact';
import 'vuact/setup-scheduler';
import 'vuact-dom/register-dom-components';

if (localStorage.getItem('vuactRendererEnabled') !== 'false') {
  setupRenderer();
}

async function renderVue() {
  const [{ createApp }, { default: App }, { default: router }] =
    await Promise.all([import('vue'), import('./App.vue'), import('./router')]);

  const app = createApp(App);

  app.use(router);
  app.mount('#app');
}

async function renderReact() {
  const [
    { createElement },
    { default: ReactDOM },
    { default: ReactDOMClient },
    { default: App },
  ] = await Promise.all([
    import('react'),
    import('react-dom'),
    import('react-dom/client'),
    import('./ReactApp'),
  ]);

  const concurrentMode = localStorage.getItem('react_concurrent_mode');

  if (concurrentMode === 'true') {
    ReactDOMClient.createRoot(document.getElementById('app')!).render(
      createElement(App)
    );
  } else {
    ReactDOM.render(createElement(App), document.getElementById('app'));
  }
}

if (location.pathname.startsWith('/react')) {
  renderReact();
} else {
  renderVue();
}
