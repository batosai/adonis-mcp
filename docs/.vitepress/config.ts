import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Adonis MCP",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // nav: [
    //   { text: 'Home', link: '/' },
    //   { text: 'Examples', link: '/markdown-examples' }
    // ],

    sidebar: [
      {
        text: 'Introduction',
        link: '/introduction'
      },
      {
        text: 'Installation',
        link: '/installation'
      },
      {
        text: 'Tools',
        link: '/tools'
      },
      {
        text: 'Resources',
        link: '/resources'
      },
      {
        text: 'Prompts',
        link: '/prompts'
      },
      {
        text: 'Sessions',
        link: '/sessions'
      },
      {
        text: 'Inspector',
        link: '/inspector'
      },
      {
        text: 'Unit Tests',
        link: '/unit-tests'
      },
      {
        text: 'ChangeLog',
        link: '/changelog',
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/batosai/adonis-mcp' }
    ]
  }
})
