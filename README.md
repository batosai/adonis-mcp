# @jrmc/adonis-mcp

[![npm version](https://badge.fury.io/js/%40jrmc%2Fadonis-mcp.svg)](https://badge.fury.io/js/%40jrmc%2Fadonis-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AdonisJS MCP - Server MCP for your AdonisJS applications.

## Roadmap

- [ ] MCP prompts support
- [ ] MCP resources support
- [ ] MCP prompts support
- [ ] Alternative transports support (SSE, stdio)
- [ ] Advanced pagination support
- [ ] Automatic schema validation with Vine ??

## Installation & Configuration

```bash
node ace add @jrmc/adonis-mcp
```

This will create a configuration file `config/mcp.ts`:

```typescript
import { defineConfig } from '@jrmc/adonis-mcp'

export default defineConfig({
  name: 'adonis-mcp-server',
  version: '1.0.0',
  path: 'app/mcp', // Path where your tools will be stored
})
```

## Usage

### Creating a Tool

To create a new tool, use the Ace command:

```bash
node ace make:mcp-tool my_tool
```

This command will create a file in `app/mcp/tools/my_tool.ts` with a base template:

```typescript
import type { McpContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema, InferJSONSchema } from '@jrmc/adonis-mcp/types/method'

import { Tool } from '@jrmc/adonis-mcp'

type Schema = BaseSchema<{
  text: { type: "string" }
}>

type Context = McpContext & { args: InferJSONSchema<Schema> }

export default class MyToolTool implements Tool<Schema> {
  name = 'tool_name'
  title = 'Tool title'
  description = 'Tool description'

  async handle({ args }: Context) {
    console.log(args.text)
  }

  schema() {
    return {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Description text argument"
        },
      },
      required: ["text"]
    } as Schema
  }
}
```

### Schema Definition

The schema defines the input parameters of your tool. It follows the [JSON Schema](https://json-schema.org/) specification:

```typescript
schema() {
  return {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Bookmark title"
      },
      url: {
        type: "string",
        description: "Bookmark URL"
      }
    },
    required: ["title", "url"]
  } as Schema
}
```

You can also use Zod to define your schema:

```typescript
import * as z from 'zod'

const zodSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional()
})

schema() {
  return z.toJSONSchema(
    zodSchema,
    { io: "input" }
  ) as Schema
}
```

### Handler Implementation

The `handle` method contains your tool's logic. It receives a typed context with validated arguments:

```typescript
async handle({ args, response, auth, bouncer }: Context) {
  // Your logic here
  const result = await SomeModel.query().where('id', args.id)
  
  return response.text(JSON.stringify({ result }))
}
```

### Using Authentication

The MCP context automatically includes the `auth` instance from the `HttpContext` if available. You can use it to access the authenticated user:

```typescript
async handle({ args, auth }: Context) {
  const user = auth?.user
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Use the authenticated user
  const bookmark = await Bookmark.create({
    title: args.title,
    userId: user.id,
  })
  
  return response.text(JSON.stringify({ bookmark }))
}
```

### Using Bouncer

The MCP context automatically includes the `bouncer` instance from the `HttpContext` if available. You can use it to check permissions:

```typescript
async handle({ args, bouncer }: Context) {
  // Check a permission
  await bouncer.authorize('viewUsers')
  
  // Or use a policy
  const user = await User.findOrFail(args.userId)
  await bouncer.with(UserPolicy).authorize('view', user)
  
  return response.text(JSON.stringify({ user }))
}
```

### Response Return

The context includes a `response` instance to format your responses. The most common method is `text()`:

```typescript
async handle({ args, response }: Context) {
  const data = { success: true, message: 'Operation completed' }
  
  return response.text(JSON.stringify(data))
}
```

### Complete Example

Here is a complete example of a tool that creates a bookmark:

```typescript
import type { McpContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema, InferJSONSchema } from '@jrmc/adonis-mcp/types/method'

import { Tool } from '@jrmc/adonis-mcp'
import Bookmark from '#models/bookmark'

type Schema = BaseSchema<{
  title: { type: "string" }
  url: { type: "string" }
}>

type Context = McpContext & { args: InferJSONSchema<Schema> }

export default class AddBookmarkTool implements Tool<Schema> {
  name = 'create_bookmark'
  title = 'Create Bookmark'
  description = 'Create a new bookmark'

  async handle({ args, response, auth }: Context) {
    const bookmark = await Bookmark.create({
      title: args.title,
      text: args.url,
      userId: auth?.user?.id,
    })

    return response.text(JSON.stringify({ bookmark }))
  }

  schema() {
    return {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Bookmark title"
        },
        url: {
          type: "string",
          description: "Bookmark URL"
        }
      },
      required: ["title", "url"]
    } as Schema
  }
}
```

## Support

For any questions or issues, please open an issue on the [GitHub repository](https://github.com/batosai/adonis-mcp).

## Inspiration

This package is inspired by [laravel/mcp](https://github.com/laravel/mcp).
