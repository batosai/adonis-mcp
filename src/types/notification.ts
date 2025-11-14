/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

export type JsonRpcNotification = {
  jsonrpc: '2.0'
  method: string
  params?: {
    [key: string]: unknown
  }
}
