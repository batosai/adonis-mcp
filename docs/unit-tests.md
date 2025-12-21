# Unit Tests

Testing is an essential part of building reliable MCP tools, resources, and prompts. This guide covers how to write unit tests for your MCP implementation using Japa, the testing framework used by AdonisJS.

## Overview

The recommended way to test MCP components (tools, resources, and prompts) is through **integration tests** using the `Server` class and `FakeTransport`. This approach tests the entire MCP flow from JSON-RPC request to response, ensuring your components work correctly in a real-world scenario.

## Setting Up Tests

First, import the required modules:

```typescript
import type { InitializeResult, ReadResourceResult, CallToolResult, CompleteResult, ListPromptsResult, GetPromptResult, TextContent, TextResourceContents } from '@jrmc/adonis-mcp/types/jsonrpc'

import { test } from '@japa/runner'
import Server from '@jrmc/adonis-mcp/server'
import FakeTransport from '@jrmc/adonis-mcp/transports/fake_transport'
import app from '@adonisjs/core/services/app'
```

## Testing Tools

### Basic Tool Test

Here's a complete example of testing a tool end-to-end:

```typescript
test.group('MCP Tool Integration', () => {
  test('should handle tool call end-to-end', async ({ assert }) => {
    // Create server instance
    const server = new Server({
      name: 'Test Server',
      version: '1.0.0'
    })

    // Register your tool
    server.addTool({
      'my_tool': app.makePath('app/mcp/tools/my_tool_tool.ts')
    })

    // Connect with fake transport
    const transport = new FakeTransport()
    await server.connect(transport)

    // Initialize the server
    await server.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {}
    })

    // Call the tool
    await server.handle({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'my_tool',
        arguments: { name: 'World' }
      }
    })

    // Check the response
    const lastMessage = transport.getLastMessage()
    const result = lastMessage?.result as CallToolResult
    const content = result?.content[0] as TextContent
    
    assert.exists(lastMessage)
    assert.equal(lastMessage?.id, 2)
    assert.exists(result)
    assert.isArray(result.content)
    assert.equal(content.type, 'text')
    assert.include(content.text, 'Hello, World')
  })
})
```

## Testing Resources

### Basic Resource Test

Test a resource with a simple URI:

```typescript
test.group('MCP Resource Integration', () => {
  test('should handle resource read end-to-end', async ({ assert }) => {
    const server = new Server({
      name: 'Test Server',
      version: '1.0.0'
    })

    // Register your resource
    server.addResource({
      'file:///document.txt': app.makePath('app/mcp/resources/document_resource.ts')
    })

    const transport = new FakeTransport()
    await server.connect(transport)

    await server.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {}
    })

    // Read the resource
    await server.handle({
      jsonrpc: '2.0',
      id: 2,
      method: 'resources/read',
      params: {
        uri: 'file:///document.txt'
      }
    })

    const lastMessage = transport.getLastMessage()
    const result = lastMessage?.result as ReadResourceResult
    const content = result?.contents[0] as TextResourceContents
    
    assert.exists(lastMessage)
    assert.equal(lastMessage?.id, 2)
    assert.exists(result)
    assert.isArray(result.contents)
    assert.equal(content.uri, 'file:///document.txt')
    assert.equal(content.mimeType, 'text/plain')
  })
})
```

### Testing Resource with URI Templates

Test a resource that uses URI template variables:

```typescript
test('should handle resource with URI template', async ({ assert }) => {
  const server = new Server({
    name: 'Test Server',
    version: '1.0.0'
  })

  // Register resource with template
  server.addResource({
    'file://{directory}/{name}.txt': app.makePath('app/mcp/resources/my_resource_resource.ts')
  })

  const transport = new FakeTransport()
  await server.connect(transport)

  await server.handle({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {}
  })

  // Read resource with template variables
  await server.handle({
    jsonrpc: '2.0',
    id: 2,
    method: 'resources/read',
    params: {
      uri: 'file://production/config.txt'
    }
  })

  const lastMessage = transport.getLastMessage()
  const result = lastMessage?.result as ReadResourceResult
  const content = result?.contents[0] as TextResourceContents
  
  assert.exists(lastMessage)
  assert.equal(lastMessage?.id, 2)
  assert.exists(result)
  assert.equal(content.uri, 'file://production/config.txt')
  assert.include(content.text, 'config')
})
```

### Testing Resource Completions

Test autocompletion for resource template variables:

```typescript
test('should provide resource completions', async ({ assert }) => {
  const server = new Server({
    name: 'Test Server',
    version: '1.0.0'
  })

  server.addResource({
    'file://{directory}/{name}.txt': app.makePath('app/mcp/resources/my_resource_resource.ts')
  })

  const transport = new FakeTransport()
  await server.connect(transport)

  await server.handle({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {}
  })

  // Request completions for 'name' argument
  await server.handle({
    jsonrpc: '2.0',
    id: 2,
    method: 'completion/complete',
    params: {
      ref: {
        type: 'ref/resource',
        uri: 'file://{directory}/{name}.txt'
      },
      argument: {
        name: 'name',
        value: 'a'
      }
    }
  })

  const lastMessage = transport.getLastMessage()
  const result = lastMessage?.result as CompleteResult
  
  assert.exists(lastMessage)
  assert.exists(result)
  assert.isArray(result.completion.values)
  assert.include(result.completion.values, 'config')
  assert.include(result.completion.values, 'settings')
})
```

## Testing Prompts

### Basic Prompt Test

Test a simple prompt:

```typescript
test.group('MCP Prompt Integration', () => {
  test('should handle prompt get end-to-end', async ({ assert }) => {
    const server = new Server({
      name: 'Test Server',
      version: '1.0.0'
    })

    // Register your prompt
    server.addPrompt({
      'my_prompt': app.makePath('app/mcp/prompts/my_prompt_prompt.ts')
    })

    const transport = new FakeTransport()
    await server.connect(transport)

    await server.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {}
    })

    // Get the prompt
    await server.handle({
      jsonrpc: '2.0',
      id: 2,
      method: 'prompts/get',
      params: {
        name: 'my_prompt',
        arguments: { text: 'Hello' }
      }
    })

    const lastMessage = transport.getLastMessage()
    const result = lastMessage?.result as GetPromptResult
    const content = result?.messages[0].content as TextContent
    
    assert.exists(lastMessage)
    assert.equal(lastMessage?.id, 2)
    assert.exists(result)
    assert.isArray(result.messages)
    assert.equal(result.messages[0].role, 'user')
    assert.equal(content.text, 'Hello, world!')
  })
})
```

## Testing Server Capabilities

### Testing Server Info

Verify server initialization and capabilities:

```typescript
test.group('MCP Server', () => {
  test('should initialize with correct capabilities', async ({ assert }) => {
    const server = new Server({
      name: 'Test Server',
      version: '1.0.0'
    })

    server.addTool({
      'my_tool': app.makePath('app/mcp/tools/my_tool_tool.ts')
    })
    server.addResource({
      'file:///doc.txt': app.makePath('app/mcp/resources/document_resource.ts')
    })
    server.addPrompt({
      'my_prompt': app.makePath('app/mcp/prompts/my_prompt_prompt.ts')
    })

    const transport = new FakeTransport()
    await server.connect(transport)

    await server.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'Test Client',
          version: '1.0.0'
        }
      }
    })

    const lastMessage = transport.getLastMessage()
    const result = lastMessage?.result as InitializeResult
    
    assert.exists(lastMessage)
    assert.exists(result)
    assert.equal(result.serverInfo.name, 'Test Server')
    assert.equal(result.serverInfo.version, '1.0.0')
    assert.exists(result.capabilities)
    assert.exists(result.capabilities.tools)
    assert.exists(result.capabilities.resources)
    assert.exists(result.capabilities.prompts)
  })
})
```
