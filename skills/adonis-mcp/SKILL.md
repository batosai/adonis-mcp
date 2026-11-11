---
name: adonis-mcp
description: Build MCP servers in AdonisJS applications with the @jrmc/adonis-mcp package. Use when creating, editing, or debugging MCP tools, resources, or prompts in an AdonisJS app, when exposing AdonisJS functionality to AI assistants via the Model Context Protocol, or when setting up, securing, or testing an @jrmc/adonis-mcp server.
metadata:
  version: "2026.11.11.1"
---

# AdonisJS MCP (@jrmc/adonis-mcp)

Build Model Context Protocol servers inside AdonisJS applications. Tools, resources, and prompts are classes auto-discovered from `app/mcp/{tools,resources,prompts}/`.

**Not installed yet?** See [references/setup.md](references/setup.md) — installation, `config/mcp.ts`, route registration, CSRF exclusion, stateless middleware, legacy sessions, stdio transport.
**Auth & permissions?** See [references/authentication.md](references/authentication.md) — auth middleware, Bouncer abilities/policies, type augmentation.
**Tests & debugging?** See [references/testing.md](references/testing.md) — Japa integration tests with `FakeTransport`, MCP Inspector.

## Critical conventions

1. **File naming is mandatory for auto-discovery**: files must end with `_tool.ts`, `_resource.ts`, or `_prompt.ts` and live under `app/mcp/tools/`, `app/mcp/resources/`, or `app/mcp/prompts/` (path configurable via `directories.mcp` in `adonisrc.ts`). A misnamed file is silently ignored.
2. **Always scaffold with ace** (uses the right stub, including the VineJS variant when the app uses VineJS):
   ```bash
   node ace make:mcp-tool my_tool
   node ace make:mcp-resource my_resource
   node ace make:mcp-prompt my_prompt
   ```
3. **Schemas are JSON Schema** and must be returned `as Schema` from `schema()`. Zod (`z.toJSONSchema(zodSchema, { io: "input" })`) or VineJS ≥ v4 (`vine.create(vineSchema).toJSONSchema()`) can generate them.
4. **Return multiple contents as an array**. There is no `response.send()` method: `return [response.text('First'), response.text('Second')]`.
5. **Always `await` bouncer calls** — forgetting `await` turns an authorization error into an unhandled rejection instead of a JSON-RPC error.

## Tool

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema } from '@jrmc/adonis-mcp/types/method'
import { Tool } from '@jrmc/adonis-mcp'

type Schema = BaseSchema<{
  title: { type: "string" }
  url: { type: "string" }
}>

export default class AddBookmarkTool extends Tool<Schema> {
  name = 'create_bookmark'          // required, unique
  title = 'Create Bookmark'         // optional
  description = 'Create a new bookmark'

  async handle({ args, response, auth, bouncer, request }: ToolContext<Schema>) {
    return response.text(JSON.stringify({ title: args?.title }))
  }

  schema() {
    return {
      type: "object",
      properties: {
        title: { type: "string", description: "Bookmark title" },
        url: { type: "string", description: "Bookmark URL" }
      },
      required: ["title", "url"]
    } as Schema
  }
}
```

Omit `schema()` and the `<Schema>` generic entirely for tools without input.

### Tool annotations (from `@jrmc/adonis-mcp/tool_annotations`)

Class decorators, combinable: `@isReadOnly()`, `@isOpenWorld()`, `@isDestructive()`, `@isIdempotent()`. Each accepts an optional boolean (`@isReadOnly(false)`).

## Resource

```typescript
import type { ResourceContext } from '@jrmc/adonis-mcp/types/context'
import { Resource } from '@jrmc/adonis-mcp'

type Args = { id: string }

export default class UserDocumentResource extends Resource<Args> {
  name = 'user_document'
  uri = 'document:///{id}'          // required, unique; RFC 6570 template
  mimeType = 'text/plain'
  title = 'User Document'
  description = 'Access user documents by ID'

  async handle({ args, response }: ResourceContext<Args>) {
    const content = await loadDocument(args?.id)
    this.size = content.length      // set size when known
    return response.text(content)   // or response.blob(buffer) for binary
  }
}
```

- URI template operators: `{name}`, `{/name}`, `{?name}`, `{&name}`, `{#name}`, `{+name}`, `{.name}`. Template variables arrive typed in `args`.
- Resource annotations (from `@jrmc/adonis-mcp/annotations`): `@priority(0.0–1.0)`, `@audience(Role.USER | Role.ASSISTANT | [both])` (Role from `@jrmc/adonis-mcp/enums/role`), `@lastModified('ISO-8601')`.

## Prompt

```typescript
import type { PromptContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema } from '@jrmc/adonis-mcp/types/method'
import { Prompt } from '@jrmc/adonis-mcp'

type Schema = BaseSchema<{
  code: { type: "string" }
  language: { type: "string" }
}>

export default class CodeReviewPrompt extends Prompt<Schema> {
  name = 'code_review'
  title = 'Code Review'
  description = 'Review code and provide feedback'

  async handle({ args, response }: PromptContext<Schema>) {
    return [
      response.text(`Please review this ${args?.language} code:`),
      response.text(args?.code),
      response.embeddedResource('file:///guidelines/coding-standards.md'),
    ]
  }

  schema() { /* same JSON Schema pattern as tools */ }
}
```

## Responses

| Method | Handlers | Use |
|---|---|---|
| `response.text(string)` | Tool, resource, prompt | Plain text |
| `response.image(base64, mime)` / `response.audio(base64, mime)` | Tool, prompt | Media |
| `response.structured(object)` | Tool | Structured JSON |
| `response.blob(stringOrBuffer)` | Resource | Text or a `Buffer`, encoded to base64 by the package |
| `response.resourceLink(uri)` | Tool | Link to a registered resource |
| `response.embeddedResource(uri)` | Tool, prompt | Embed a registered resource |
| `response.error(message)` | Tool, resource | Tool error or JSON-RPC resource error |

Return an array directly for multiple tool or prompt contents. Text, image, audio, blob, resource
link, embedded resource, and error content support `.withMeta({ ... })`; structured content does not.

## Errors

For a specific JSON-RPC error code or extra data, throw instead of `response.error()`:

```typescript
import JsonRpcException from '@jrmc/adonis-mcp/exceptions'
import { ErrorCode } from '@jrmc/adonis-mcp/enums/error'

throw new JsonRpcException('Not found', ErrorCode.InvalidParams, request.id, { resource: 'user' })
```

Available `ErrorCode` values include `ConnectionClosed` (-32000), `RequestTimeout` (-32001),
`HeaderMismatch` (-32020), `MissingRequiredClientCapability` (-32021),
`UnsupportedProtocolVersion` (-32022), `ParseError` (-32700), `InvalidRequest` (-32600),
`MethodNotFound` (-32601), `InvalidParams` (-32602), and `InternalError` (-32603). Exceptions work
in tools, resources, and prompts (`request.id` comes from the context).

## Protocol-aware handlers

Handlers can inspect `protocolEra`, `protocolVersion`, `clientCapabilities`, `clientInfo`, and
`logLevel` from their context. Modern `2026-07-28` requests are stateless; legacy clients use
`initialize` and `MCP-Session-Id`. Read [references/setup.md](references/setup.md) before changing
the generated middleware or cache policy.

A primitive tool argument can require a mirrored HTTP header:

```typescript
region: { 'type': 'string', 'x-mcp-header': 'Region' }
```

For modern `tools/call`, the body value must match `Mcp-Param-Region`. Restrict this annotation to
primitive `string`, `integer`, or `boolean` properties.

## VineJS validation in handlers

If the VineJS provider is registered (`@jrmc/adonis-mcp/vinejs_provider` in `adonisrc.ts`), reuse your app's validators — validation errors become JSON-RPC errors automatically, no try/catch:

```typescript
async handle({ request, response }: ToolContext) {
  const payload = await request.validateUsing(ArticleValidator)
  // ...
}
```

## Completions (autocomplete for prompt args / resource template variables)

Requires `completions: true` in `config/mcp.ts`. Implement `complete()` on the prompt or resource:

```typescript
import type { CompleteContext } from '@jrmc/adonis-mcp/types/context'

async complete({ args, response }: CompleteContext<Args>) {
  if (args?.language !== undefined) {
    return response.complete({ values: ['typescript', 'python'] }) // + optional hasMore, total
  }
  return response.complete({ values: [] })
}
```

## Dependency injection

Standard AdonisJS `@inject()` works on constructors and `handle()` methods of tools/resources/prompts.

## Events

`mcp:request` and `mcp:response` are emitted on the AdonisJS emitter (`JsonRpcRequest` / `JsonRpcResponse` from `@jrmc/adonis-mcp/types/jsonrpc`).
