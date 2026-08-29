/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type {
  ClientCapabilities,
  Implementation,
  JsonRpcRequest,
  RequestMetaObject,
} from '../../types/jsonrpc.js'

export const MODERN_PROTOCOL_VERSION = '2026-07-28'
export const LEGACY_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18'] as const
export const SUPPORTED_PROTOCOL_VERSIONS = [
  MODERN_PROTOCOL_VERSION,
  ...LEGACY_PROTOCOL_VERSIONS,
] as const

export type ProtocolEra = 'modern' | 'legacy'

export type ProtocolEnvelope = {
  protocolVersion?: string
  clientCapabilities?: ClientCapabilities
  clientInfo?: Implementation
  logLevel?: string
}

export function getRequestMeta(request: JsonRpcRequest): RequestMetaObject | undefined {
  return request.params?._meta
}

export function getProtocolEnvelope(request: JsonRpcRequest): ProtocolEnvelope {
  const meta = getRequestMeta(request)

  if (meta?.['io.modelcontextprotocol/protocolVersion']) {
    return {
      protocolVersion: meta['io.modelcontextprotocol/protocolVersion'],
      clientCapabilities: meta['io.modelcontextprotocol/clientCapabilities'],
      clientInfo: meta['io.modelcontextprotocol/clientInfo'],
      logLevel: meta['io.modelcontextprotocol/logLevel'],
    }
  }

  if (request.method === 'initialize') {
    return {
      protocolVersion:
        typeof request.params?.protocolVersion === 'string'
          ? request.params.protocolVersion
          : undefined,
      clientCapabilities: request.params?.capabilities as ClientCapabilities | undefined,
      clientInfo: request.params?.clientInfo as Implementation | undefined,
    }
  }

  return {}
}

export function getProtocolEra(request: JsonRpcRequest): ProtocolEra {
  return typeof getRequestMeta(request)?.['io.modelcontextprotocol/protocolVersion'] === 'string'
    ? 'modern'
    : 'legacy'
}

export function isModernProtocolRequest(
  headerVersion?: string,
  metadataVersion?: unknown
): boolean {
  return headerVersion === MODERN_PROTOCOL_VERSION || metadataVersion === MODERN_PROTOCOL_VERSION
}
