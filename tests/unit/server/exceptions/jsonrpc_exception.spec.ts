/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import JsonRpcException from '../../../../src/server/exceptions/jsonrpc_exception.js'
import { ErrorCode } from '../../../../src/enums/error.js'

test.group('JsonRpcException', () => {
  test('should create exception with message, code and request id', ({ assert }) => {
    const exception = new JsonRpcException('Test error', ErrorCode.InvalidRequest, 123)

    assert.equal(exception.message, 'Test error')
    assert.instanceOf(exception, Error)
  })

  test('should convert to JSON-RPC response', ({ assert }) => {
    const exception = new JsonRpcException('Test error', ErrorCode.InvalidRequest, 123)
    const response = exception.toJsonRpcResponse()

    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, 123)
    assert.exists(response.error)
    assert.equal(response.error?.code, ErrorCode.InvalidRequest)
    assert.equal(response.error?.message, 'Test error')
  })

  test('should include data in error response when provided', ({ assert }) => {
    const data = { field: 'value' }
    const exception = new JsonRpcException('Test error', ErrorCode.InternalError, 456, data)
    const response = exception.toJsonRpcResponse()

    assert.deepEqual(response.error?.data, data)
  })
})
