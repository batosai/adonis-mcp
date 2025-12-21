# Sessions

Sessions in MCP provide a way to maintain state and track interactions between AI clients and your AdonisJS application. The MCP protocol uses a session identifier system to ensure continuity across multiple requests.

## Overview

MCP sessions are managed through the **MCP Middleware**, which automatically handles session identification using HTTP headers. This allows you to:

- Maintain context across multiple tool calls
- Track conversation history
- Implement multi-step workflows
- Associate requests with specific client sessions

> **⚠️ Important: HTTP Transport Only**
>
> The MCP session system described in this document is **only available when using HTTP transport**. It relies on HTTP headers (`MCP-Session-Id`) to track sessions between the client and server.
>

## How MCP Sessions Work

### Session Lifecycle

The MCP middleware manages sessions through the `MCP-Session-Id` header:

1. **Initialization**: When a client sends an `initialize` request, the middleware generates a unique session ID
2. **Subsequent Requests**: The client must include this session ID in all subsequent requests
3. **Session Tracking**: The middleware validates and echoes back the session ID in responses

### The MCP Middleware

When you install `@jrmc/adonis-mcp`, a middleware file is automatically created at `#middleware/mcp_middleware.ts`:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class McpMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const body = ctx.request.body()
    const method = body.method

    const contentType = ctx.request.header('Content-Type')
    if (!contentType || !['application/json', 'text/event-stream'].includes(contentType)) {
      return ctx.response.badRequest('Content-Type header must be application/json')
    }

    if (method === 'initialize') {
      // Generate a new session ID for initialize requests
      ctx.response.safeHeader('MCP-Session-Id', crypto.randomUUID())
    } else {
      // Require session ID for all other requests
      const sessionId = ctx.request.header('MCP-Session-Id')

      if (!sessionId) {
        return ctx.response.badRequest('MCP-Session-Id header is required')
      }

      // Echo back the session ID
      ctx.response.safeHeader('MCP-Session-Id', sessionId)
    }

    return next()
  }
}
```

### Registering the MCP Middleware

The middleware must be registered in your `start/kernel.ts` file to be active on all MCP routes:

```typescript
import router from '@adonisjs/core/services/router'

router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('#middleware/mcp_middleware'),
])
```

## Customizing the MCP Middleware

You can customize the middleware to add additional session management logic:

### Adding Session Cleanup

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import redis from '@adonisjs/redis/services/main'

export default class McpMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const body = ctx.request.body()
    const method = body.method

    const contentType = ctx.request.header('Content-Type')
    if (!contentType || !['application/json', 'text/event-stream'].includes(contentType)) {
      return ctx.response.badRequest('Content-Type header must be application/json')
    }

    if (method === 'initialize') {
      const sessionId = crypto.randomUUID()
      ctx.response.safeHeader('MCP-Session-Id', sessionId)
      
      // Initialize session data in Redis
      await redis.setex(`mcp:session:${sessionId}:active`, 3600, '1')
    } else {
      const sessionId = ctx.request.header('MCP-Session-Id')

      if (!sessionId) {
        return ctx.response.badRequest('MCP-Session-Id header is required')
      }
      
      // Validate session is still active
      const isActive = await redis.get(`mcp:session:${sessionId}:active`)
      if (!isActive) {
        return ctx.response.badRequest('Session expired')
      }
      
      // Extend session expiration
      await redis.expire(`mcp:session:${sessionId}:active`, 3600)

      ctx.response.safeHeader('MCP-Session-Id', sessionId)
    }

    return next()
  }
}
```

### Logging Session Activity

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'

export default class McpMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const body = ctx.request.body()
    const method = body.method

    const contentType = ctx.request.header('Content-Type')
    if (!contentType || !['application/json', 'text/event-stream'].includes(contentType)) {
      return ctx.response.badRequest('Content-Type header must be application/json')
    }

    if (method === 'initialize') {
      const sessionId = crypto.randomUUID()
      ctx.response.safeHeader('MCP-Session-Id', sessionId)
      
      logger.info({ sessionId, method }, 'New MCP session initialized')
    } else {
      const sessionId = ctx.request.header('MCP-Session-Id')

      if (!sessionId) {
        return ctx.response.badRequest('MCP-Session-Id header is required')
      }

      ctx.response.safeHeader('MCP-Session-Id', sessionId)
      
      logger.info({ sessionId, method }, 'MCP request')
    }

    return next()
  }
}
```


## Limitations and Considerations

### Session ID Format

The default implementation uses UUIDs for session IDs. If you need a different format, customize the middleware:

```typescript
// Example: Using shorter, alphanumeric IDs
import { nanoid } from 'nanoid'

if (method === 'initialize') {
  const sessionId = nanoid(21) // Generates URL-safe ID
  ctx.response.safeHeader('MCP-Session-Id', sessionId)
}
```

### Cross-Origin Requests

If your MCP server accepts requests from different origins, ensure proper CORS configuration and be aware of session security implications.

### Scalability

When running multiple server instances:

- Use Redis or another shared storage for session data (not in-memory)
- Ensure all instances can access the same session store

## Transport Compatibility

### HTTP Transport

The MCP session system is **designed for HTTP transport only**. When using HTTP transport:

- Sessions are tracked via the `MCP-Session-Id` HTTP header
- The middleware automatically generates and validates session IDs
- Session data can be stored in any backend (database, Redis, memory)
- Sessions persist across multiple HTTP requests


