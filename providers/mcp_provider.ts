/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ApplicationService } from '@adonisjs/core/types'
import type { RouteGroup } from '@adonisjs/core/http'
import type { McpConfig } from '../src/types/config.js'
// import type { Tool } from '../src/types.js'

import { fsReadAll } from '@adonisjs/core/helpers'
import McpServer from '../src/server.js'

export default class McpProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('jrmc.mcp', async () => {
      const config = this.app.config.get<McpConfig>('mcp', {})

      return new McpServer(config)
    })
  }

  async start() {
    const router = await this.app.container.make('router')
    const McpController = () => import('../src/server/controllers/mcp_controller.js')

    router.mcp = (pattern: string = '/mcp') => {
      return router.group(() => {
        router.post(pattern, [McpController, 'post'])
      })
    }

    await this.registerTools()
    // await this.registerResources()
    // await this.registerPrompts()
  }

  async registerTools() {
    const server = await this.app.container.make('jrmc.mcp')
    const path = this.app.makePath(server.config.path!)
    const files = await fsReadAll(path, {
      filter: (filePath) => filePath.includes('_tool.ts'),
    })

    await Promise.all(
      files.map(async (file) => {
        const path = this.app.makePath(server.config.path!, file)
        const { default: tool } = await import(path)
        const toolInstance = new tool()
        server.addTool({
          [toolInstance.name]: path,
        })
      })
    )
  }

  // async registerResources() {
  //   const mcp = await this.app.container.make('jrmc.mcp')
  //   const collection = await fsImportAll(new URL(this.app.makePath(mcp.config.path!), import.meta.url), {
  //     filter: (filePath) => filePath.includes('_resource.ts')
  //   })

  //   Object.values(collection).map((item: any) => {
  //     const resourceMcp = new item()

  //     mcp.getServer().registerResource(resourceMcp.name, resourceMcp.uriOrTemplate, resourceMcp.config, resourceMcp.handle)
  //   })
  // }

  // async registerPrompts() {
  //   const mcp = await this.app.container.make('jrmc.mcp')
  //   const collection = await fsImportAll(new URL(this.app.makePath(mcp.config.path!), import.meta.url), {
  //     filter: (filePath) => filePath.includes('_prompt.ts')
  //   })

  //   Object.values(collection).map((item: any) => {
  //     const promptMcp = new item()

  //     mcp.getServer().registerPrompt(promptMcp.name, promptMcp.config, promptMcp.handle)
  //   })
  // }
}

declare module '@adonisjs/core/http' {
  interface Router {
    mcp: (pattern?: string) => RouteGroup
  }
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'jrmc.mcp': McpServer
  }
}
