/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolResponse, ResourceResponse, PromptResponse } from '../types/response.js'
import type { Resource } from './resource.js'
import type { AnyTool as Tool } from './tool.js'
import type { AnyPrompt as Prompt } from './prompt.js'
export abstract class Content {
  abstract toTool(tool: Tool): ToolResponse
  abstract toPrompt(prompt: Prompt): PromptResponse
  abstract toResource(resource: Resource): ResourceResponse
}
