import type { Context } from './context.js'

export interface Request {
  ctx: Context
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: {
    cursor?: string
    [key: string]: unknown
  }
}
