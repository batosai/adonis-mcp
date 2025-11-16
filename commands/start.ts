/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { JsonRpcRequest } from '../src/types/request.js'

import { BaseCommand } from '@adonisjs/core/ace'

import McpServer from '../src/server.js'
import StdioTransport from '../src/transport/stdio_transport.js'

export default class MakeTool extends BaseCommand {
  static commandName = 'mcp:start'
  static description = 'Start the MCP server stdio transport'

  static options: CommandOptions = {
    startApp: true,
    // stayAlive: true,
  }

  #server: McpServer | null = null

  async run() {

    try {
      this.#server = await this.app.container.make('jrmc.mcp')

      const transport = new StdioTransport()
      await this.#server.connect(transport)
      transport.on('mcp:stdio:transport:message', async (message: JsonRpcRequest) => {
        await this.#server?.handle(message)
      })

    } catch (error: any) {
      throw error
    }
  }
}
