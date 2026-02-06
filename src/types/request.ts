/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type {
  CallToolRequest,
  ReadResourceRequest,
  GetPromptRequest,
  InitializeRequest,
  PingRequest,
  ListToolsRequest,
  ListResourcesRequest,
  ListResourceTemplatesRequest,
  ListPromptsRequest,
  CompleteRequest,
  SubscribeRequest,
  UnsubscribeRequest,
} from './jsonrpc.js'

type RequestMap = {
  'tools/call': CallToolRequest
  'resources/read': ReadResourceRequest
  'prompts/get': GetPromptRequest
  'initialize': InitializeRequest
  'ping': PingRequest
  'tools/list': ListToolsRequest
  'resources/list': ListResourcesRequest
  'resources/templates/list': ListResourceTemplatesRequest
  'prompts/list': ListPromptsRequest
  'completion/complete': CompleteRequest
  'resources/subscribe': SubscribeRequest
  'resources/unsubscribe': UnsubscribeRequest
}

export type McpRequestType = keyof RequestMap

export type McpRequest<T extends McpRequestType> = T extends keyof RequestMap
  ? RequestMap[T]
  : never

export interface McpResourceRequest extends McpRequest<'resources/read'> {}
export interface McpToolRequest extends McpRequest<'tools/call'> {}
export interface McpPromptRequest extends McpRequest<'prompts/get'> {}
export interface McpCompleteRequest extends McpRequest<'completion/complete'> {}
