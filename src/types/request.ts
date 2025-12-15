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

export type McpRequest<T> = T extends 'tools/call'
  ? CallToolRequest
  : T extends 'resources/read'
    ? ReadResourceRequest
    : T extends 'prompts/get'
      ? GetPromptRequest
      : T extends 'initialize'
        ? InitializeRequest
        : T extends 'ping'
          ? PingRequest
          : T extends 'tools/list'
            ? ListToolsRequest
            : T extends 'resources/list'
              ? ListResourcesRequest
              : T extends 'resources/templates/list'
                ? ListResourceTemplatesRequest
                : T extends 'prompts/list'
                  ? ListPromptsRequest
                  : T extends 'completion/complete'
                    ? CompleteRequest
                    : T extends 'resources/subscribe'
                      ? SubscribeRequest
                      : T extends 'resources/unsubscribe'
                        ? UnsubscribeRequest
                        : never
