import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Vuact UI',
  description: 'Vue 3 adapters for React UI libraries, powered by vuact',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Migration', link: '/guide/migration' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          ],
        },
      ],
    },
  },
});
