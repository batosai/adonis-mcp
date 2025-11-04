/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { args, BaseCommand } from '@adonisjs/core/ace'
import string from '@adonisjs/core/helpers/string'
import { stubsRoot } from '../../stubs/main.js'

export default class MakeTool extends BaseCommand {
  static commandName = 'make:mcp-tool'
  static description = 'Create a new MCP tool'

  @args.string({ description: 'Name of the tool' })
  declare name: string

  async run() {
    const codemods = await this.createCodemods()
    const stubPath = `make/mcp/tools/main.ts.stub`

    await codemods.makeUsingStub(stubsRoot, stubPath, {
      className: `${string.snakeCase(this.name)}Tool`
    })

    this.logger.success(`Tool created successfully for: ${this.name}`)
  }
}
