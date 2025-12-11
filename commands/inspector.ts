/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CommandOptions } from '@adonisjs/core/types/ace'

import { $ } from 'execa'
import { args, BaseCommand } from '@adonisjs/core/ace'

export default class Inspector extends BaseCommand {
  static commandName = 'mcp:inspector'
  static description = 'Open the MCP Inspector tool to debug and test MCP Servers.'

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

    if (this.transport === 'http') {
      const router = await this.app.container.make('router')

      const serverUrl = router
        .builder()
        .prefixUrl(`http://${process.env.HOST}:${process.env.PORT}`)
        .disableRouteLookup()
        .make('/mcp')

      const inspectorProcess = $({
        stdio: 'inherit',
      })`npx @modelcontextprotocol/inspector --transport http --server-url ${serverUrl}`

      await inspectorProcess
    } else {
      const nodeBinary = process.execPath
      const acePath = this.app.makePath('ace.js')

      const inspectorProcess = $({
        stdio: 'inherit',
      })`npx @modelcontextprotocol/inspector --transport stdio ${nodeBinary} ${acePath} mcp:start`

      await inspectorProcess
    }
  }
}
