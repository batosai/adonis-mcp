import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Adonis MCP",
  description: "Model Context Protocol for AdonisJS",
  head: [
    [
      'script',
      {
        'defer': '',
        'src': 'https://umami.jrmc.dev/script.js',
        'data-website-id': 'f972c66b-7885-43fb-a20e-9c77fc1d6347',
      },
    ],
  ],
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
        text: 'Validation',
        link: '/validation'
      },
      {
        text: 'Dependency Injection',
        link: '/dependency-injection'
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
