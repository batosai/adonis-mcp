/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ZodRawShape, ZodType, ZodTypeDef, ZodOptional, ZodTypeAny, z } from 'zod'
import type{ ResourceMetadata } from '@modelcontextprotocol/sdk/server/mcp.js'
import type{ ToolAnnotations, ServerRequest, ServerNotification, GetPromptResult, CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import type { ReadResourceResult, Implementation } from '@modelcontextprotocol/sdk/types.js'
import type { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js'

import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'

export { ResourceTemplate }

export type McpConfig = {
  path?: string
  serverOptions?: Implementation
}

export interface Tool {
  name: string
  config: {
    title?: string;
    description?: string;
    inputSchema?: ZodRawShape;
    outputSchema?: ZodRawShape;
    annotations?: ToolAnnotations;
    _meta?: Record<string, unknown>;
  }
  handle(
    argsOrExtra: z.objectOutputType<ZodRawShape, ZodTypeAny> | RequestHandlerExtra<ServerRequest, ServerNotification>,
    extra?: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): CallToolResult | Promise<CallToolResult>
}

export interface Resource {
  name: string
  uriOrTemplate: string | ResourceTemplate
  config: ResourceMetadata
  handle(uri: URL, variablesOrExtra: Variables | RequestHandlerExtra<ServerRequest, ServerNotification>, extra?: RequestHandlerExtra<ServerRequest, ServerNotification>): ReadResourceResult | Promise<ReadResourceResult>
}

type PromptArgsRawShape = {
  [k: string]: ZodType<string, ZodTypeDef, string> | ZodOptional<ZodType<string, ZodTypeDef, string>>;
};


export interface Prompt {
  name: string
  config: {
    title?: string;
    description?: string;
    argsSchema?: PromptArgsRawShape
  }
  handle(
    argsOrExtra: z.objectOutputType<PromptArgsRawShape, ZodTypeAny> | RequestHandlerExtra<ServerRequest, ServerNotification>,
    extra?: RequestHandlerExtra<ServerRequest, ServerNotification>
  ): GetPromptResult | Promise<GetPromptResult>
}