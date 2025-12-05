/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Prompt } from '../../../src/server/prompt.js'
import type { PromptContext } from '../../../src/types/context.js'
import type { JSONSchema } from '../../../src/types/method.js'
import Role from '../../../src/enums/role.js'

export default class TestPrompt2 extends Prompt<JSONSchema> {
  name = 'test-prompt-2'
  title = 'Test Prompt 2'
  description = 'Second test prompt'
  role = Role.ASSISTANT

  schema() {
    return {
      type: 'object' as const,
      properties: {
        number: {
          type: 'number' as const,
          description: 'Number input',
        },
      },
      required: [],
    }
  }

  async handle({ args, response }: PromptContext & { args: { number?: number } }) {
    return response.text(`Hello from test prompt 2: ${args.number ?? 'no number'}`)
  }
}
