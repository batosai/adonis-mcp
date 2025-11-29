/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { PromptContext } from '../types/context.js'
import type { McpPromptResponse } from '../types/response.js'

export abstract class Prompt {

  abstract handle(
    ctx?: PromptContext
  ): Promise<McpPromptResponse>
}
