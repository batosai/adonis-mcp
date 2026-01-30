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

export type McpRequestType =
  | 'tools/call'
  | 'resources/read'
  | 'prompts/get'
  | 'initialize'
  | 'ping'
  | 'tools/list'
  | 'resources/list'
  | 'resources/templates/list'
  | 'prompts/list'
  | 'completion/complete'
  | 'resources/subscribe'
  | 'resources/unsubscribe'

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

export type McpRequest<T extends McpRequestType> = RequestMap[T]
