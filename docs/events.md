# Events

Adonis MCP emits events via the AdonisJS emitter during the variant generation lifecycle.

## Available Events

| Event | Description |
|-------|-------------|
| `mcp:request` | Emitted when JSON RPC Request |
| `mcp:response` | Emitted when JSON RPC Response |

## Listening to Events

Create a preload file to listen to MCP events:

```sh
node ace make:preload events
```

```ts
// start/attachment.ts
import emitter from '@adonisjs/core/services/emitter'
import type { JsonRpcRequest, JsonRpcResponse } from '@jrmc/adonis-mcp/types/jsonrpc'

emitter.on('mcp:request', (request: JsonRpcRequest) => {
  logger.info(request)
})

emitter.on('mcp:response', (response: JsonRpcResponse) => {
  logger.info(response)
})
```