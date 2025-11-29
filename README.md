# @jrmc/adonis-mcp

[![npm version](https://badge.fury.io/js/%40jrmc%2Fadonis-mcp.svg)](https://badge.fury.io/js/%40jrmc%2Fadonis-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AdonisJS MCP - Server MCP for your AdonisJS applications.

## Roadmap

- [x] MCP tools support
- [x] MCP resources support
- [ ] MCP prompts support
- [x] HTTP transport
- [x] Stdio transport
- [x] Fake transport (for testing)
- [x] Advanced pagination support
- [ ] Alternative transports support SSE
- [ ] Automatic schema validation with Vine ??
- [ ] Documentation

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

### Setting up Authentication and Bouncer

To use `auth` and `bouncer` in your MCP tools, add the following TypeScript declaration in your middleware (e.g., in your Bouncer initialization middleware):

```typescript
declare module '@jrmc/adonis-mcp/types/context' {
  export interface McpContext {
    auth?: {
      user?: HttpContext['auth']['user']
    }
    bouncer?: Bouncer<
      Exclude<HttpContext['auth']['user'], undefined>,
      typeof abilities,
      typeof policies
    >
  }
}
```

The MCP context automatically binds `auth` and `bouncer` from the `HttpContext` if they are available, so make sure your middleware initializes them on the `HttpContext` first.

#### Registering the MCP Route

In your `start/routes.ts` file, register the MCP route and apply middleware:

```typescript
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

// Register MCP route (defaults to /mcp, or specify a custom path)
router.mcp().use(middleware.auth())
```

You can also specify a custom path:

```typescript
router.mcp('/custom-mcp-path').use(middleware.auth())
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

The context includes a `response` instance to format your responses. The available methods depend on the context type:

#### Tool Responses

For tools, you can use:

- `response.text(text: string)`: Return plain text content
- `response.image(data: string, mimeType: string)`: Return image content (base64 encoded)
- `response.audio(data: string, mimeType: string)`: Return audio content (base64 encoded)
- `response.error(message: string)`: Return an error message
- `response.send(content: Content | Content[])`: Send custom content objects

```typescript
async handle({ args, response }: Context) {
  // Return text
  return response.text(JSON.stringify({ success: true }))
  
  // Return image
  const imageData = await fs.readFile('path/to/image.png', 'base64')
  return response.image(imageData, 'image/png')
  
  // Return error
  return response.error('Something went wrong')
}
```

#### Resource Responses

For resources, you can use:

- `response.text(text: string)`: Return text content
- `response.blob(text: string)`: Return binary content (base64 encoded)

```typescript
async handle({ response }: ResourceContext) {
  const content = await fs.readFile('path/to/file.txt', 'utf-8')
  return response.text(content)
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

### Creating a Resource

To create a new resource, use the Ace command:

```bash
node ace make:mcp-resource my_resource
```

This command will create a file in `app/mcp/resources/my_resource.ts` with a base template:

```typescript
import type { ResourceContext } from '@jrmc/adonis-mcp/types/context'

import { Resource } from '@jrmc/adonis-mcp'

export default class MyResourceResource implements Resource {
  name = 'example.txt'
  uri = 'file:///example.txt'
  mimeType = 'text/plain'
  title = 'Resource title'
  description = 'Resource description'
  size = 0

  async handle({ response }: ResourceContext) {
    this.size = 1000
    return response.text('Hello World')
  }
}
```

### Resource Properties

Resources have the following properties:

- `name` (optional): The name of the resource
- `uri` (required): The unique identifier for the resource (must be unique)
- `mimeType` (optional): The MIME type of the resource
- `title` (optional): A human-readable title
- `description` (optional): A description of the resource
- `size` (optional): The size of the resource in bytes

### Resource Handler

The `handle` method returns the content of the resource. You can use `response.text()` for text content or `response.blob()` for binary content:

```typescript
async handle({ response }: ResourceContext) {
  const content = await fs.readFile('path/to/file.txt', 'utf-8')
  this.size = content.length
  return response.text(content)
}
```

### Transports

The package supports multiple transport mechanisms:

- **HTTP Transport**: Default transport for HTTP-based MCP servers (used when accessing via HTTP routes)
- **Stdio Transport**: For command-line MCP servers that communicate via standard input/output
- **Fake Transport**: For testing purposes, allows you to capture and inspect MCP messages

### Pagination

The `tools/list` and `resources/list` methods support cursor-based pagination to handle large numbers of tools and resources efficiently. This is particularly useful when you have many tools or resources registered in your application. [More information](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/pagination)

## Support

For any questions or issues, please open an issue on the [GitHub repository](https://github.com/batosai/adonis-mcp).

## Inspiration

This package is inspired by [laravel/mcp](https://github.com/laravel/mcp).
