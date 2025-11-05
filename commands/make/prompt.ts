/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { args, BaseCommand } from '@adonisjs/core/ace'
import string from '@adonisjs/core/helpers/string'
import { stubsRoot } from '../../stubs/main.js'

export default class MakePrompt extends BaseCommand {
  static commandName = 'make:mcp-prompt'
  static description = 'Create a new MCP prompt'

  @args.string({ description: 'Name of the prompt' })
  declare name: string

  async run() {
    const codemods = await this.createCodemods()
    const stubPath = `make/mcp/prompts/main.ts.stub`

    await codemods.makeUsingStub(stubsRoot, stubPath, {
      className: `${string.pascalCase(this.name)}Prompt`
    })

    this.logger.success(`Prompt created successfully for: ${this.name}`)
  }
}
