/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

export type RequestId = string | number
export type ProgressToken = string | number

export type JsonRpcRequest = {
  jsonrpc: '2.0'
  id: RequestId
  method: string
  params?: {
    cursor?: string
    _meta?: {
      progressToken?: ProgressToken
      [key: string]: unknown
    }
    [key: string]: unknown
  }
}

export type JsonRpcResponse = {
  jsonrpc: '2.0'
  id: string | number
  result?: JsonRpcResult
  error?: JsonRpcError
}

export type JsonRpcResult = {
  _meta?: { [key: string]: unknown }
  [key: string]: unknown
}

export type JsonRpcError = {
  code: number
  message: string
  data?: unknown
}

export type JsonRpcNotification = {
  jsonrpc: '2.0'
  method: string
  params?: {
    [key: string]: unknown
  }
}

// ANNOTATIONS

export type ToolAnnotations = {
  destructiveHint?: boolean
  idempotentHint?: boolean
  openWorldHint?: boolean
  readOnlyHint?: boolean
  title?: string
}

export type Annotations = {
  audience?: Role[]
  lastModified?: string
  priority?: number
}

// CONTENT TYPES

export type Role = 'user' | 'assistant'

export type ErrorBuilder = {
  type: 'text'
  text: string
}

export type TextContent = {
  type: 'text'
  text: string
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type ImageContent = {
  type: 'image'
  data: string
  mimeType: string
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type AudioContent = {
  type: 'audio'
  data: string
  mimeType: string
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type StructuredContent = Record<string, unknown>

export type BlobResourceContents = {
  blob: string
  mimeType?: string
  uri: string
  _meta?: { [key: string]: unknown }
}

export type TextResourceContents = {
  text: string
  mimeType?: string
  uri: string
  _meta?: { [key: string]: unknown }
}

export type ResourceLink = {
  type: 'resource_link'
  name: string
  size?: number
  title?: string
  description?: string
  mimeType?: string
  uri: string
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type EmbeddedResource = {
  type: 'resource'
  resource: BlobResourceContents | TextResourceContents
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type ContentBlock =
  | TextContent
  | ImageContent
  | AudioContent
  | EmbeddedResource
  | ResourceLink

// REQUEST TYPES

export type PromptReference = {
  name: string
  title?: string
  type: 'ref/prompt'
}

export type ResourceTemplateReference = {
  type: 'ref/resource'
  uri: string
}

export type InitializeRequest = JsonRpcRequest & {
  method: 'initialize'
  params: {
    protocolVersion: string
    capabilities: ClientCapabilities
    clientInfo: Implementation
  }
}

export type PingRequest = JsonRpcRequest & {
  method: 'ping'
  params?: {
    _meta?: { progressToken?: ProgressToken; [key: string]: unknown }
    [key: string]: unknown
  }
}

export type CallToolRequest = JsonRpcRequest & {
  method: 'tools/call'
  params: {
    name: string
    arguments?: Record<string, unknown>
  }
}

export type ListToolsRequest = JsonRpcRequest & {
  method: 'tools/list'
  params?: { cursor?: string }
}

export type ReadResourceRequest = JsonRpcRequest & {
  method: 'resources/read'
  params: {
    uri: string
  }
}

export type ListResourcesRequest = JsonRpcRequest & {
  method: 'resources/list'
  params?: {
    cursor?: string
  }
}
export type ListResourceTemplatesRequest = JsonRpcRequest & {
  method: 'resources/templates/list'
  params?: { cursor?: string }
}

export type GetPromptRequest = JsonRpcRequest & {
  method: 'prompts/get'
  params: {
    arguments?: {
      [key: string]: string
    }
    name: string
  }
}

export type ListPromptsRequest = JsonRpcRequest & {
  method: 'prompts/list'
  params?: { cursor?: string }
}

export type CompleteRequest = JsonRpcRequest & {
  method: 'completion/complete'
  params: {
    argument: { name: string; value: string }
    context?: { arguments?: { [key: string]: string } }
    ref: PromptReference | ResourceTemplateReference
  }
}

export type SubscribeRequest = JsonRpcRequest & {
  method: 'resources/subscribe'
  params: { uri: string }
}

export type UnsubscribeRequest = JsonRpcRequest & {
  method: 'resources/unsubscribe'
  params: { uri: string }
}

// Result types

export type InitializeResult = {
  _meta?: { [key: string]: unknown }
  capabilities: ServerCapabilities
  instructions?: string
  protocolVersion: string
  serverInfo: Implementation
  [key: string]: unknown
}

export type GetPromptResult = {
  _meta?: { [key: string]: unknown }
  description?: string
  messages: PromptMessage[]
  [key: string]: unknown
}

export type ListPromptsResult = {
  _meta?: { [key: string]: unknown }
  nextCursor?: string
  prompts: Prompt[]
  [key: string]: unknown
}

export type ListResourcesResult = {
  _meta?: { [key: string]: unknown }
  nextCursor?: string
  resources: Resource[]
  [key: string]: unknown
}

export type ReadResourceResult = {
  _meta?: { [key: string]: unknown }
  contents: (TextResourceContents | BlobResourceContents)[]
  [key: string]: unknown
}

export type ListResourceTemplatesResult = {
  _meta?: { [key: string]: unknown }
  nextCursor?: string
  resourceTemplates: ResourceTemplate[]
  [key: string]: unknown
}

export type CallToolResult = {
  _meta?: { [key: string]: unknown }
  content: ContentBlock[]
  isError?: boolean
  structuredContent?: { [key: string]: unknown }
  [key: string]: unknown
}

export type ListToolsResult = {
  _meta?: { [key: string]: unknown }
  nextCursor?: string
  tools: Tool[]
  [key: string]: unknown
}

export type CompleteResult = {
  _meta?: { [key: string]: unknown }
  completion: Completion
  [key: string]: unknown
}

//

export type Completion = { hasMore?: boolean; total?: number; values: string[] }

type ClientCapabilities = {
  elicitation?: object
  experimental?: { [key: string]: object }
  roots?: { listChanged?: boolean }
  sampling?: object
}

type ServerCapabilities = {
  completions?: object
  experimental?: { [key: string]: object }
  logging?: object
  prompts?: { listChanged?: boolean }
  resources?: { listChanged?: boolean; subscribe?: boolean }
  tools?: { listChanged?: boolean }
}

type Implementation = {
  name: string
  title?: string
  version: string
}

export type PromptMessage = {
  content: ContentBlock
  role: Role
}

type Prompt = {
  _meta?: { [key: string]: unknown }
  arguments?: PromptArgument[]
  description?: string
  name: string
  title?: string
}

type PromptArgument = {
  description?: string
  name: string
  required?: boolean
  title?: string
}

type Resource = {
  _meta?: { [key: string]: unknown }
  annotations?: Annotations
  description?: string
  mimeType?: string
  name: string
  size?: number
  title?: string
  uri: string
}

type ResourceTemplate = {
  _meta?: { [key: string]: unknown }
  annotations?: Annotations
  description?: string
  mimeType?: string
  name: string
  title?: string
  uriTemplate: string
}

type Tool = {
  _meta?: { [key: string]: unknown }
  annotations?: ToolAnnotations
  description?: string
  inputSchema: {
    properties?: { [key: string]: object }
    required?: string[]
    type: 'object'
  }
  name: string
  outputSchema?: {
    properties?: { [key: string]: object }
    required?: string[]
    type: 'object'
  }
  title?: string
}
