# Authentication & Authorization

Adonis MCP integrates with [AdonisJS Auth](https://docs.adonisjs.com/guides/auth/introduction) and [Bouncer](https://docs.adonisjs.com/guides/auth/authorization) to let you authenticate users and check permissions inside your MCP handlers.

## Overview

When an HTTP request reaches your MCP server, the **MCP middleware** can initialize the AdonisJS Bouncer (and Auth) on the `HttpContext`. The MCP transport then wraps the Bouncer instance in an `McpBouncer` so that authorization failures are automatically converted into proper JSON-RPC error responses instead of HTTP exceptions.

## Setup

### 1. Install Bouncer

If you haven't already, install and configure `@adonisjs/bouncer` in your AdonisJS application:

```bash
node ace add @adonisjs/bouncer
```

This will create the abilities file (`app/abilities/main.ts`), the policies directory, and the `initialize_bouncer_middleware`.

### 2. Configure the MCP Middleware

Open the MCP middleware generated at `app/middleware/mcp_middleware.ts` and uncomment the authentication and bouncer sections:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type * as abilities from '#abilities/main'
import type { policies } from '#generated/policies'
import type McpBouncer from '@jrmc/adonis-mcp/bouncer'

import crypto from 'node:crypto'

export default class McpMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const body = ctx.request.body()
    const method = body.method

    const contentType = ctx.request.header('Content-Type')
    if (!contentType || !['application/json', 'text/event-stream'].includes(contentType)) {
      return ctx.response.badRequest('Content-Type header must be application/json')
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

declare module '@jrmc/adonis-mcp/types/context' {
  export interface McpContext {
    auth: {
      user: HttpContext['auth']['user']
    }
    bouncer: McpBouncer<
      Exclude<HttpContext['auth']['user'], undefined>,
      typeof abilities,
      typeof policies
    >
  }
}
```

::: tip Key points
- The `declare module` block at the bottom augments `McpContext` with your app's concrete types — this gives you **full autocompletion** on ability names, policy methods, and their arguments inside your handlers.
- `McpBouncer` automatically converts Bouncer's `E_AUTHORIZATION_FAILURE` exceptions into JSON-RPC error responses.
:::

### 3. Apply the MCP Middleware to the Route

In `start/routes.ts`, you must apply the MCP middleware to the MCP route. This middleware handles session management (`MCP-Session-Id` header) and content-type validation:

```typescript
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router.mcp().use(middleware.mcp())
```

::: tip
The MCP middleware is automatically registered as a named middleware during installation. If it's missing, see the [Sessions documentation](./sessions.md) for manual registration instructions.
:::

### 4. Apply Auth Middleware to the MCP Route

To use authentication, also apply your auth middleware to the MCP route so that `ctx.auth` is available:

```typescript
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router.mcp().use([middleware.mcp(), middleware.auth()])
```

If you want to allow unauthenticated access (guest), you can use a guard that allows optional auth:

```typescript
router.mcp().use([middleware.mcp(), middleware.auth({ guards: ['api'] })])
```

## Using Auth in Handlers

Once configured, the `auth` object is available in your Tools, Resources, and Prompts:

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import { Tool } from '@jrmc/adonis-mcp'

export default class GetProfileTool extends Tool {
  name = 'get_profile'
  description = 'Returns the authenticated user profile'

  async handle({ auth, response }: ToolContext) {
    const user = auth.user

    if (!user) {
      return response.error('Not authenticated')
    }

    return response.text(JSON.stringify({
      id: user.id,
      name: user.fullName,
      email: user.email,
    }))
  }
}
```

## Using Bouncer in Handlers

### Checking Abilities

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import { Tool } from '@jrmc/adonis-mcp'
import { viewAdmin } from '#abilities/main'

export default class AdminDashboardTool extends Tool {
  name = 'admin_dashboard'
  description = 'Returns admin dashboard data'

  async handle({ bouncer, response }: ToolContext) {
    // Throws a JSON-RPC error if the user is not authorized
    await bouncer.authorize(viewAdmin)

    return response.text(JSON.stringify({ stats: '...' }))
  }
}
```

### Using Policies

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema } from '@jrmc/adonis-mcp/types/method'
import { Tool } from '@jrmc/adonis-mcp'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'

type Schema = BaseSchema<{
  userId: { type: "number" }
}>

export default class ViewUserTool extends Tool<Schema> {
  name = 'view_user'
  description = 'View a user profile'

  async handle({ args, bouncer, response }: ToolContext<Schema>) {
    const user = await User.findOrFail(args?.userId)

    // Authorize using a policy — throws JSON-RPC error if denied
    await bouncer.with(UserPolicy).authorize('view', user)

    return response.text(JSON.stringify(user))
  }

  schema() {
    return {
      type: "object",
      properties: {
        userId: {
          type: "number",
          description: "The ID of the user to view"
        }
      },
      required: ["userId"]
    } as Schema
  }
}
```

### Conditional Checks

If you want to check permissions without throwing, use `allows` or `denies`:

```typescript
async handle({ bouncer, response }: ToolContext) {
  const canEdit = await bouncer.allows(editPost, post)

  if (canEdit) {
    return response.text('You can edit this post')
  }

  return response.text('Read-only access')
}
```

### Multiple Authorization Checks

```typescript
async handle({ bouncer, args, response }: ToolContext<Schema>) {
  const post = await Post.findOrFail(args?.postId)

  // Check ability
  await bouncer.authorize(managePost)

  // Also check policy
  await bouncer.with(PostPolicy).authorize('edit', post)

  // If we reach here, both checks passed
  await post.merge({ title: args?.title }).save()

  return response.text('Post updated successfully')
}
```

## How McpBouncer Works

When `ctx.bouncer` is set on `HttpContext`, the MCP HTTP transport automatically wraps it in an `McpBouncer` instance. This wrapper:

1. **Preserves the full Bouncer API** — `execute`, `allows`, `denies`, `authorize`, `with`, and `deny` all work identically.
2. **Converts authorization errors** — Bouncer's `E_AUTHORIZATION_FAILURE` (which is designed for HTTP responses) is caught and re-thrown as a `JsonRpcException` with `ErrorCode.InvalidRequest` (-32600).
3. **Wraps policy authorizers** — When you call `bouncer.with(SomePolicy)`, the returned policy authorizer is also wrapped, so `.authorize()`, `.allows()`, `.denies()`, and `.execute()` on policies are equally safe.

This means you never need to manually catch authorization errors in your handlers — they are automatically serialized as proper JSON-RPC error responses:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32600,
    "message": "Access denied"
  }
}
```

## Type Safety

The `declare module` block in the middleware is what gives you full type-safety. Without it, `bouncer` is untyped (`McpBouncer<any, any, any>`). With it, TypeScript knows your exact abilities and policies:

```typescript
// ✅ Autocompletion on ability names
await bouncer.authorize(editUser)

// ✅ Autocompletion on policy methods and their arguments
await bouncer.with(UserPolicy).authorize('view', user)

// ❌ TypeScript error — unknown ability
await bouncer.authorize(unknownAbility)

// ❌ TypeScript error — wrong arguments for policy method
await bouncer.with(UserPolicy).authorize('view')
```

::: warning Important
Always `await` bouncer calls. Since `authorize`, `allows`, `denies`, and `execute` are all async, forgetting `await` will cause the authorization error to be an unhandled promise rejection instead of a proper JSON-RPC error response.
:::

## Resources and Prompts

Authentication and authorization work the same way in Resources and Prompts:

### Resource Example

```typescript
import type { ResourceContext } from '@jrmc/adonis-mcp/types/context'
import { Resource } from '@jrmc/adonis-mcp'
import UserPolicy from '#policies/user_policy'

export default class SecretDocResource extends Resource {
  uri = 'file:///docs/secret'
  name = 'Secret Document'
  description = 'A confidential document'

  async handle({ bouncer, response }: ResourceContext) {
    await bouncer.with(UserPolicy).authorize('viewSecret')

    return response.text('Top secret content here...')
  }
}
```

### Prompt Example

```typescript
import type { PromptContext } from '@jrmc/adonis-mcp/types/context'
import { Prompt } from '@jrmc/adonis-mcp'
import { viewAdmin } from '#abilities/main'

export default class AdminReportPrompt extends Prompt {
  name = 'admin_report'
  description = 'Generate an admin report'

  async handle({ bouncer, response }: PromptContext) {
    await bouncer.authorize(viewAdmin)

    return response.message('user', response.text('Please generate the monthly admin report.'))
  }
}
```
