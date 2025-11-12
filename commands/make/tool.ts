/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CommandOptions } from '@adonisjs/core/types/ace'
import type { McpConfig } from '@jrmc/adonis-mcp/types/config'

import { args, BaseCommand } from '@adonisjs/core/ace'
import string from '@adonisjs/core/helpers/string'
import { stubsRoot } from '../../stubs/main.js'

export default class MakeTool extends BaseCommand {
  static commandName = 'make:mcp-tool'
  static description = 'Create a new MCP tool'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Name of the tool' })
  declare name: string

  async run() {
    const config = this.app.config.get<McpConfig>('mcp', { path: 'app/mcp' })
    const codemods = await this.createCodemods()
    const stubPath = `make/mcp/tools/main.ts.stub`

    await codemods.makeUsingStub(stubsRoot, stubPath, {
      name: string.pascalCase(this.name),
      basePath: config.path
    })

    this.logger.success(`Tool created successfully for: ${this.name}`)
  }
}
