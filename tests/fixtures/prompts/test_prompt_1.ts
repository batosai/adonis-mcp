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

export default class TestPrompt1 extends Prompt<JSONSchema> {
  name = 'test-prompt-1'
  title = 'Test Prompt 1'
  description = 'First test prompt'
  role = Role.USER

  schema() {
    return {
      type: 'object' as const,
      properties: {
        text: {
          type: 'string' as const,
          description: 'Text input',
        },
      },
      required: ['text'],
    }
  }

  async handle({ args, response }: PromptContext & { args: { text: string } }) {
    return response.text(`Hello from test prompt 1: ${args.text}`)
  }
}

