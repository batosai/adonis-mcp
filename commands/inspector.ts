/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CommandOptions } from '@adonisjs/core/types/ace'

import { $ } from 'execa'
import { args, BaseCommand } from '@adonisjs/core/ace'
import { ensureInspectorServer } from '../src/utils/inspector_catalog.js'

export default class Inspector extends BaseCommand {
  static commandName = 'mcp:inspector'
  static description = 'Open the MCP Inspector tool to debug and test MCP Servers.'
  static aliases = ['mcp:inspect']

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Transport type', default: 'http' })
  declare transport: string

  async run() {
    if (this.app.inProduction) {
      this.logger.error('Cannot open MCP inspector in production environment')
      return
    }

    if (this.transport !== 'http' && this.transport !== 'stdio') {
      this.logger.error('Invalid transport type')
      return
    }

    const catalogPath = this.app.makePath('.mcp-inspector.json')

    if (this.transport === 'http') {
      const router = await this.app.container.make('router')

      const serverUrl = router
        .builder()
        .prefixUrl(`http://${process.env.HOST}:${process.env.PORT}`)
        .disableRouteLookup()
        .make('/mcp')

      await ensureInspectorServer(catalogPath, 'adonis-mcp-http', {
        type: 'http',
        url: serverUrl,
        protocolEra: 'modern',
      })

      const inspectorProcess = $({
        stdio: 'inherit',
      })`npx @modelcontextprotocol/inspector --catalog ${catalogPath}`

      await inspectorProcess
    } else {
      const nodeBinary = process.execPath
      const acePath = this.app.makePath('ace.js')

      await ensureInspectorServer(catalogPath, 'adonis-mcp-stdio', {
        type: 'stdio',
        command: nodeBinary,
        args: [acePath, 'mcp:start'],
        protocolEra: 'legacy',
      })

      const inspectorProcess = $({
        stdio: 'inherit',
      })`npx @modelcontextprotocol/inspector --catalog ${catalogPath}`

      await inspectorProcess
    }
  }
}
