/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcRequest, RequestId } from '../../types/jsonrpc.js'
import type { McpContext } from '../../types/context.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'

type HeaderReader = (name: string) => string | undefined

type HeaderDeclaration = {
  headerName: string
  path: string[]
  type: 'string' | 'integer' | 'boolean'
}

function headerMismatch(requestId: RequestId, message: string, data?: Record<string, unknown>) {
  return new JsonRpcException(message, ErrorCode.HeaderMismatch, requestId, data)
}

function getRequestName(request: JsonRpcRequest): string | undefined {
  if (request.method === 'resources/read') {
    return typeof request.params?.uri === 'string' ? request.params.uri : undefined
  }

  if (request.method === 'tools/call' || request.method === 'prompts/get') {
    return typeof request.params?.name === 'string' ? request.params.name : undefined
  }
}

function collectHeaderDeclarations(
  schema: Record<string, unknown>,
  path: string[] = []
): HeaderDeclaration[] {
  const properties = schema.properties
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return []
  }

  const declarations: HeaderDeclaration[] = []

  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    if (!propertySchema || typeof propertySchema !== 'object' || Array.isArray(propertySchema)) {
      continue
    }

    const definition = propertySchema as Record<string, unknown>
    const propertyPath = [...path, propertyName]
    const headerName = definition['x-mcp-header']
    const type = definition.type

    if (
      typeof headerName === 'string' &&
      (type === 'string' || type === 'integer' || type === 'boolean')
    ) {
      declarations.push({ headerName, path: propertyPath, type })
    }

    declarations.push(...collectHeaderDeclarations(definition, propertyPath))
  }

  return declarations
}

function getValueAtPath(value: unknown, path: string[]): unknown {
  let current = value

  for (const segment of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

function encodeHeaderValue(value: string | number | boolean): string {
  const stringValue = String(value)
  const isSafeAscii = /^[\x21-\x7e]+$/.test(stringValue) && !stringValue.startsWith('=?base64?')

  return isSafeAscii
    ? stringValue
    : `=?base64?${Buffer.from(stringValue, 'utf8').toString('base64')}?=`
}

function validateToolParameterHeaders(
  request: JsonRpcRequest,
  ctx: McpContext,
  readHeader: HeaderReader
) {
  if (request.method !== 'tools/call' || typeof request.params?.name !== 'string') {
    return
  }

  const inputSchema = ctx.tools[request.params.name]?.json.inputSchema
  if (!inputSchema || typeof inputSchema !== 'object' || Array.isArray(inputSchema)) {
    return
  }

  const declarations = collectHeaderDeclarations(inputSchema as Record<string, unknown>)
  const argumentsValue = request.params.arguments

  for (const declaration of declarations) {
    const value = getValueAtPath(argumentsValue, declaration.path)
    const header = `Mcp-Param-${declaration.headerName}`
    const actual = readHeader(header)

    if (value === undefined || value === null) {
      if (actual !== undefined) {
        throw headerMismatch(request.id, `${header} does not match the request body`, { header })
      }
      continue
    }

    const isValidType =
      (declaration.type === 'string' && typeof value === 'string') ||
      (declaration.type === 'boolean' && typeof value === 'boolean') ||
      (declaration.type === 'integer' && Number.isSafeInteger(value))

    if (!isValidType || actual !== encodeHeaderValue(value as string | number | boolean)) {
      throw headerMismatch(request.id, `${header} does not match the request body`, { header })
    }
  }
}

export function validateModernHttpHeaders(
  request: JsonRpcRequest,
  ctx: McpContext,
  readHeader: HeaderReader
) {
  if (ctx.protocolEra !== 'modern') {
    return
  }

  const expectedVersion = ctx.protocolVersion
  const actualVersion = readHeader('MCP-Protocol-Version')
  if (!actualVersion || actualVersion !== expectedVersion) {
    throw headerMismatch(request.id, 'MCP-Protocol-Version does not match the request body', {
      header: 'MCP-Protocol-Version',
    })
  }

  const actualMethod = readHeader('Mcp-Method')
  if (!actualMethod || actualMethod !== request.method) {
    throw headerMismatch(request.id, 'Mcp-Method does not match the request body', {
      header: 'Mcp-Method',
    })
  }

  const expectedName = getRequestName(request)
  if (expectedName !== undefined) {
    const actualName = readHeader('Mcp-Name')
    if (!actualName || actualName !== expectedName) {
      throw headerMismatch(request.id, 'Mcp-Name does not match the request body', {
        header: 'Mcp-Name',
      })
    }
  }

  validateToolParameterHeaders(request, ctx, readHeader)
}
