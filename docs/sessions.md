# MCP middleware and sessions

`@jrmc/adonis-mcp` supports both MCP protocol generations:

| Protocol version | Lifecycle | HTTP session |
| --- | --- | --- |
| `2026-07-28` | Stateless requests and `server/discover` | None |
| `2025-11-25`, `2025-06-18` | `initialize` handshake | `MCP-Session-Id` |

Modern requests carry their protocol version, client capabilities, and optional client identity in
`params._meta`. They can be routed to any application instance without sticky sessions or shared
MCP session storage.

Legacy clients continue to use `initialize`. The generated middleware creates and echoes an
`MCP-Session-Id` for those clients only.

## The MCP middleware

Installation creates `app/middleware/mcp_middleware.ts` with dual-generation support:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { isModernProtocolRequest } from '@jrmc/adonis-mcp/protocols/version'

import crypto from 'node:crypto'

export default class McpMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const body = ctx.request.body()
    const method = body.method

    const contentType = ctx.request.header('Content-Type')?.split(';', 1)[0]
    if (contentType !== 'application/json') {
      return ctx.response.badRequest('Content-Type header must be application/json')
    }

    const headerVersion = ctx.request.header('MCP-Protocol-Version')
    const metadataVersion = body.params?._meta?.['io.modelcontextprotocol/protocolVersion']

    if (isModernProtocolRequest(headerVersion, metadataVersion)) {
      return next()
    }

    if (method === 'initialize') {
      ctx.response.safeHeader('MCP-Session-Id', crypto.randomUUID())
    } else {
      const sessionId = ctx.request.header('MCP-Session-Id')

      if (!sessionId) {
        return ctx.response.badRequest('MCP-Session-Id header is required')
      }

      ctx.response.safeHeader('MCP-Session-Id', sessionId)
    }

    return next()
  }
}
```

The middleware deliberately does not validate modern routing headers. `HttpTransport` performs
that validation so mismatches use the MCP `HeaderMismatch` JSON-RPC error and HTTP status 400.

## Registering the middleware

Register it in `start/kernel.ts` and apply it to the MCP route:

```typescript
export const middleware = router.named({
  mcp: () => import('#middleware/mcp_middleware'),
})
```

```typescript
router.mcp().use(middleware.mcp())
```

## Application state

Removing the protocol session does not prevent a modern tool from maintaining application state.
Return an explicit identifier such as `cartId` or `workflowId`, then accept it as an argument on
later tool calls. This keeps state visible and allows every request to reach any server instance.

If you add Redis-backed session validation for legacy clients, keep the modern early return before
that logic. Modern requests must never require or emit `MCP-Session-Id`.
