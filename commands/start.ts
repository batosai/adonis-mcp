/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { JsonRpcRequest } from '../src/types/jsonrpc.js'

import { BaseCommand } from '@adonisjs/core/ace'

import McpServer from '../src/server.js'
import StdioTransport from '../src/server/transports/stdio_transport.js'

export default class MakeTool extends BaseCommand {
  static commandName = 'mcp:start'
  static description = 'Start the MCP server stdio transport'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  #server: McpServer | null = null

  async run() {
    this.#server = await this.app.container.make('jrmc.mcp')
    const transport = new StdioTransport()
    const pending = new Set<Promise<unknown>>()

    transport.on('mcp:stdio:transport:message', (message: JsonRpcRequest) => {
      const task = this.#server!.handle(message).catch((error) => {
        this.exitCode = 1
        this.logger.error(error.message)
      })
      pending.add(task)
      void task.finally(() => pending.delete(task))
    })

    const ended = new Promise<void>((resolve) => {
      transport.once('mcp:stdio:transport:end', resolve)
    })
    await this.#server.connect(transport)
    await ended
    await Promise.all(pending)
    transport.close()
    await this.terminate()
  }
}
