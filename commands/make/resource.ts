/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CommandOptions } from '@adonisjs/core/types/ace'

import { args, BaseCommand } from '@adonisjs/core/ace'
import string from '@adonisjs/core/helpers/string'
import { stubsRoot } from '../../stubs/main.js'

export default class MakeResource extends BaseCommand {
  static commandName = 'make:mcp-resource'
  static description = 'Create a new MCP resource'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Name of the resource' })
  declare name: string

  async run() {
    const codemods = await this.createCodemods()
    const stubPath = `make/mcp/resources/main.ts.stub`

    await codemods.makeUsingStub(stubsRoot, stubPath, {
      name: string.pascalCase(this.name),
    })

    this.logger.success(`Resource created successfully for: ${this.name}`)
  }
}
