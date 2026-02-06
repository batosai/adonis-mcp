# Tools

Tools are functions that AI models can call to perform actions in your application. They provide a structured way to expose your application's functionality to AI assistants.

## Creating Tools

To create a new tool, use the Ace command:

```bash
node ace make:mcp-tool my_tool
```

This command will create a file in `app/mcp/tools/my_tool.ts` with a base template:

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema } from '@jrmc/adonis-mcp/types/method'

import { Tool } from '@jrmc/adonis-mcp'

type Schema = BaseSchema<{
  name: { type: "string" }
}>

export default class MyToolTool extends Tool<Schema> {
  name = 'MyTool'
  title = 'Tool title'
  description = 'Tool description'

  async handle({ args, response }: ToolContext<Schema>) {
    return response.text(`Hello, ${args?.name}`)
  }

  schema() {
    return {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Description text argument"
        },
      },
      required: ["name"]
    } as Schema
  }
}
```

### Simple Tool Without Schema

If your tool doesn't need any input parameters, you can omit the schema entirely:

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import { Tool } from '@jrmc/adonis-mcp'

export default class GetServerTimeTool extends Tool {
  name = 'get_server_time'
  title = 'Get Server Time'
  description = 'Returns the current server time'

  async handle({ response }: ToolContext) {
    const currentTime = new Date().toISOString()
    return response.text(`Current server time: ${currentTime}`)
  }
}
```

This is useful for simple tools that perform actions without needing any input from the user.

### Tool Properties

Each tool must define the following properties:

- **name**: A unique identifier for the tool (required)
- **title**: A human-readable title (optional)
- **description**: A description of what the tool does (optional)

## Tool Input Schemas

The schema defines the input parameters of your tool. It follows the [JSON Schema](https://json-schema.org/) specification.

### Basic Schema

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

### Using Zod

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

### Supported Types

JSON Schema supports various data types:

- `string`: Text values
- `number`: Numeric values
- `integer`: Whole numbers
- `boolean`: True/false values
- `array`: Lists of values
- `object`: Nested objects

Example with complex types:

```typescript
schema() {
  return {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "User name"
      },
      age: {
        type: "integer",
        minimum: 0,
        maximum: 150
      },
      tags: {
        type: "array",
        items: { type: "string" }
      },
      settings: {
        type: "object",
        properties: {
          theme: { type: "string" },
          notifications: { type: "boolean" }
        }
      }
    },
    required: ["name"]
  } as Schema
}
```

## Handler Implementation

The `handle` method contains your tool's logic. It receives a typed context with validated arguments:

```typescript
async handle({ args, response, auth, bouncer }: ToolContext<Schema>) {
  // Access validated arguments
  const result = await SomeModel.query().where('id', args?.id)
  
  // Use authentication if available
  const user = auth?.user
  
  // Check permissions with Bouncer
  await bouncer?.authorize('viewData')
  
  // Return a response
  return response.text(JSON.stringify({ result }))
}
```

### Context Properties

The `ToolContext` provides:

- **args**: The validated input arguments (typed based on your schema)
- **request**: The MCP request instance (see [Validation](/validation) for VineJS validation with `validateUsing()`)
- **response**: Response builder with various formatting methods
- **auth**: AdonisJS auth instance (if authentication middleware is applied)
- **bouncer**: AdonisJS bouncer instance (if available)

For validating arguments with VineJS, see [Validation](/validation).

### Using Authentication

```typescript
async handle({ args, auth, response }: ToolContext<Schema>) {
  const user = auth?.user
  
  return response.text(`Hello, ${user?.name}`)
}
```

### Using Bouncer

```typescript
async handle({ args, bouncer, response }: ToolContext<Schema>) {
  // Check a permission
  await bouncer?.authorize('viewUsers')
  
  // Or use a policy
  const user = await User.findOrFail(args?.userId)
  await bouncer?.with(UserPolicy).authorize('view', user)
  
  return response.text(JSON.stringify({ user }))
}
```

## Tool Responses

The context includes a `response` instance to format your responses. The following methods are available:

### Text Response

Return plain text content:

```typescript
return response.text(JSON.stringify({ success: true }))
```

### Structured Data

Return structured JSON data (useful for AI parsing):

```typescript
return response.structured({
  temperature: 22.5,
  conditions: 'Partly cloudy',
  humidity: 65
})
```

### Image Response

Return base64-encoded image content:

```typescript
const imageData = await fs.readFile('path/to/image.png', 'base64')
return response.image(imageData, 'image/png')
```

### Audio Response

Return base64-encoded audio content:

```typescript
const audioData = await fs.readFile('path/to/audio.mp3', 'base64')
return response.audio(audioData, 'audio/mpeg')
```

### Resource Link

Return a link to another resource:

```typescript
return response.resourceLink('file:///path/to/resource.txt')
```

### Error Response

You can signal an error in two ways.

**Using the response helper** (simple message):

```typescript
return response.error('Something went wrong')
```

**Throwing a JSON-RPC exception** (custom error code and optional data). Use this when you need a specific [JSON-RPC error code](https://www.jsonrpc.org/specification#error_object) or extra `data` for the client:

```typescript
import JsonRpcException from '@jrmc/adonis-mcp/exceptions'
import { ErrorCode } from '@jrmc/adonis-mcp/enums/error'

async handle({ request, response }: ToolContext) {
  if (someCondition) {
    throw new JsonRpcException('Invalid request', ErrorCode.InvalidRequest, request.id)
  }

  // Optional: pass additional data to the client
  throw new JsonRpcException('Not found', ErrorCode.InvalidParams, request.id, {
    resource: 'user',
    id: userId,
  })
}
```

Available `ErrorCode` values: `InvalidRequest` (-32600), `MethodNotFound` (-32601), `InvalidParams` (-32602), `InternalError` (-32603), `ConnectionClosed` (-32000), `RequestTimeout` (-32001).

The same exception can be thrown from **Resources** and **Prompts** handlers (use `request.id` from the context).

### Multiple Contents

You can return multiple content items:

```typescript
return response.send([
  response.text('Here is some information:'),
  response.structured({ data: 'value' }),
  response.resourceLink('file:///docs/help.txt')
])
```

### Response Metadata

Add metadata to any response using `withMeta()`:

```typescript
return response.text(JSON.stringify(users)).withMeta({
  source: 'database',
  queryTime: Date.now(),
  count: users.length,
  cacheHit: false
})
```

## Tool Annotations

Annotations provide additional metadata about your tools to help AI clients understand their behavior.

### @isReadOnly()

Indicates that a tool only reads data and does not modify any state:

```typescript
import { Tool } from '@jrmc/adonis-mcp'
import { isReadOnly } from '@jrmc/adonis-mcp/tool_annotations'

@isReadOnly()
export default class GetUserTool extends Tool {
  name = 'get_user'
  
  async handle({ args, response }: ToolContext) {
    const user = await User.find(args?.id)
    return response.text(JSON.stringify(user))
  }
}
```

You can also explicitly set it to false:

```typescript
@isReadOnly(false)
export default class UpdateUserTool extends Tool {
  // ...
}
```

### @isOpenWorld()

Indicates that a tool can access information from the internet or external sources:

```typescript
import { isOpenWorld } from '@jrmc/adonis-mcp/tool_annotations'

@isOpenWorld()
export default class FetchWeatherTool extends Tool {
  name = 'fetch_weather'
  
  async handle({ args, response }: ToolContext) {
    const weather = await externalApi.getWeather(args?.city)
    return response.text(JSON.stringify(weather))
  }
}
```

### @isDestructive()

Indicates that a tool performs destructive operations like deleting data:

```typescript
import { isDestructive } from '@jrmc/adonis-mcp/tool_annotations'

@isDestructive()
export default class DeleteUserTool extends Tool {
  name = 'delete_user'
  
  async handle({ args, response }: ToolContext) {
    await User.query().where('id', args?.id).delete()
    return response.text('User deleted successfully')
  }
}
```

### @isIdempotent()

Indicates that a tool can be safely called multiple times with the same arguments without causing different effects:

```typescript
import { isIdempotent } from '@jrmc/adonis-mcp/tool_annotations'

@isIdempotent()
export default class SetUserStatusTool extends Tool {
  name = 'set_user_status'
  
  async handle({ args, response }: ToolContext) {
    await User.query().where('id', args?.id).update({ status: args?.status })
    return response.text('Status updated')
  }
}
```

### Combining Multiple Annotations

You can use multiple annotations on the same tool:

```typescript
import { isReadOnly, isOpenWorld, isIdempotent } from '@jrmc/adonis-mcp/tool_annotations'

@isReadOnly()
@isOpenWorld()
@isIdempotent()
export default class SearchOnlineTool extends Tool {
  name = 'search_online'
  
  async handle({ args, response }: ToolContext) {
    const results = await searchEngine.search(args?.query)
    return response.text(JSON.stringify(results))
  }
}
```

## Complete Example

Here is a complete example of a tool that creates a bookmark:

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import type { BaseSchema } from '@jrmc/adonis-mcp/types/method'

import { Tool } from '@jrmc/adonis-mcp'
import Bookmark from '#models/bookmark'

type Schema = BaseSchema<{
  title: { type: "string" }
  url: { type: "string" }
}>

export default class AddBookmarkTool extends Tool<Schema> {
  name = 'create_bookmark'
  title = 'Create Bookmark'
  description = 'Create a new bookmark'

  async handle({ args, response, auth }: ToolContext<Schema>) {
    const bookmark = await Bookmark.create({
      title: args?.title,
      text: args?.url,
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