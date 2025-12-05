/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import ServerContext from '../../../src/server/context.js'
import { createJsonRpcRequest } from '../../helpers/create_request.js'

test.group('ServerContext', () => {
  test('should create context with default values', ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: { tools: { listChanged: false } },
      serverName: 'Test Server',
      serverVersion: '1.0.0',
      instructions: 'Test instructions',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.serverName, 'Test Server')
    assert.equal(context.serverVersion, '1.0.0')
    assert.equal(context.instructions, 'Test instructions')
    assert.equal(context.maxPaginationLength, 50)
    assert.equal(context.defaultPaginationLength, 15)
    assert.exists(context.request)
    assert.exists(context.response)
  })

  test('getPerPage should return requested per page if less than max', ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.getPerPage(10), 10)
    assert.equal(context.getPerPage(20), 20)
  })

  test('getPerPage should return max pagination length if requested exceeds max', ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.getPerPage(100), 50)
    assert.equal(context.getPerPage(60), 50)
  })

  test('getPerPage should return default if no value provided', ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.getPerPage(), 15)
  })
})
