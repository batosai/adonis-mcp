/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolResponse, ResourceResponse, PromptResponse } from '../types/response.js'

export abstract class Content {
  abstract toTool(): ToolResponse
  abstract toPrompt(): PromptResponse
  abstract toResource(): ResourceResponse
}