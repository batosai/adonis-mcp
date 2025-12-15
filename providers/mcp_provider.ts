/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ApplicationService } from '@adonisjs/core/types'
import type { RouteGroup } from '@adonisjs/core/http'
import type { McpConfig } from '../src/types/config.js'

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
    await this.registerResources()
    await this.registerPrompts()
  }

  async registerTools() {
    this.registerMethods('tool')
  }

  async registerResources() {
    this.registerMethods('resource')
  }

  async registerPrompts() {
    this.registerMethods('prompt')
  }

  async registerMethods(type: 'tool' | 'resource' | 'prompt') {
    const server = await this.app.container.make('jrmc.mcp')
    const mcpPath = this.app.makePath(this.app.rcFile.directories['mcp'] || 'app/mcp/')
    const files = await fsReadAll(mcpPath, {
      filter: (filePath) => filePath.includes(`_${type}.ts`),
    })

    await Promise.all(
      files.map(async (file) => {
        const path = this.app.makePath(mcpPath, file)
        const { default: Method } = await import(path)
        const instance = new Method()

        switch (type) {
          case 'tool':
            server.addTool({
              [instance.name]: path,
            })
            break
          case 'resource':
            server.addResource({
              [instance.uri]: path,
            })
            break
          case 'prompt':
            server.addPrompt({
              [instance.name]: path,
            })
            break
        }
      })
    )
  }
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
