# Resources

Resources represent data or content that AI models can access from your application. They provide a structured way to expose files, documents, database records, or any other content.

## Creating Resources

To create a new resource, use the Ace command:

```bash
node ace make:mcp-resource my_resource
```

This command will create a file in `app/mcp/resources/my_resource.ts` with a base template:

```typescript
import type { ResourceContext } from '@jrmc/adonis-mcp/types/context'

import { Resource } from '@jrmc/adonis-mcp'

export default class MyResourceResource extends Resource {
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

- **uri** (required): The unique identifier for the resource (must be unique across all resources)
- **name** (optional): The name of the resource
- **mimeType** (optional): The MIME type of the resource (e.g., `text/plain`, `application/json`)
- **title** (optional): A human-readable title
- **description** (optional): A description of the resource
- **size** (optional): The size of the resource in bytes

## Resource Templates

Resources support URI templates (RFC 6570) to create dynamic resources. This allows you to define resources with variable parts in their URIs.

### Basic Template

```typescript
import type { ResourceContext } from '@jrmc/adonis-mcp/types/context'
import { Resource } from '@jrmc/adonis-mcp'

type Args = {
  name: string
}

export default class DynamicFileResource extends Resource<Args> {
  name = 'dynamic_file'
  uri = 'file:///{name}.txt'
  mimeType = 'text/plain'
  title = 'Dynamic file'
  description = 'Access files dynamically by name'

  async handle({ args, response }: ResourceContext<Args>) {
    const content = await readFile(args?.name)
    this.size = content.length
    return response.text(content)
  }
}
```

When a client requests `file:///robots.txt`, the template `file:///{name}.txt` will match and extract `name: "robots"` as an argument.

### Template Operators

URI templates support various operators:

- `{name}` - Simple variable substitution
- `{/name}` - Path segment
- `{?name}` - Query parameter
- `{&name}` - Additional query parameter
- `{#name}` - Fragment identifier
- `{+name}` - Reserved characters allowed
- `{.name}` - Dot-prefixed segment

Example with multiple variables:

```typescript
type Args = {
  directory: string
  filename: string
}

export default class NestedFileResource extends Resource<Args> {
  uri = 'file:///{directory}/{filename}.txt'
  
  async handle({ args, response }: ResourceContext<Args>) {
    const path = `${args?.directory}/${args?.filename}.txt`
    const content = await readFile(path)
    return response.text(content)
  }
}
```

For more information, see [RFC 6570](https://www.rfc-editor.org/rfc/rfc6570).

## Resource URI and MIME Type

### URI Format

The URI must be a valid URI string and should be unique across all resources. Common URI schemes:

- `file:///` - For file system resources
- `http://` or `https://` - For web resources
- `data://` - For data URIs
- Custom schemes - You can define your own URI schemes

Examples:

```typescript
// File resource
uri = 'file:///documents/readme.txt'

// Web resource
uri = 'https://api.example.com/data'

// Custom scheme
uri = 'myapp://users/profile'
```

### MIME Types

MIME types help AI clients understand the content format. Common MIME types:

- `text/plain` - Plain text
- `text/html` - HTML content
- `text/markdown` - Markdown content
- `application/json` - JSON data
- `application/pdf` - PDF documents
- `image/png`, `image/jpeg` - Images
- `audio/mpeg` - Audio files

```typescript
export default class JsonDataResource extends Resource {
  uri = 'data://users'
  mimeType = 'application/json'
  
  async handle({ response }: ResourceContext) {
    const users = await User.all()
    return response.text(JSON.stringify(users))
  }
}
```

## Resource Request

The `handle` method processes resource requests and returns the content. It receives a `ResourceContext` with:

- **args**: Extracted variables from URI templates (if applicable)
- **request**: The MCP request instance (see [Validation](/validation) for VineJS validation with `validateUsing()`)
- **response**: Response builder with formatting methods
- **auth**: AdonisJS auth instance (if authentication middleware is applied)
- **bouncer**: AdonisJS bouncer instance (if available)

### Simple Resource

```typescript
async handle({ response }: ResourceContext) {
  const content = 'Hello, World!'
  this.size = content.length
  return response.text(content)
}
```

### Dynamic Resource with Arguments

```typescript
async handle({ args, response }: ResourceContext<Args>) {
  const file = await File.findBy('name', args?.name)
  
  if (!file) {
    throw new Error('File not found')
  }
  
  this.size = file.size
  return response.text(file.content)
}
```

### Authenticated Resource

```typescript
async handle({ auth, response }: ResourceContext) {
  const user = auth?.user
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  const documents = await user.related('documents').query()
  const content = JSON.stringify(documents)
  
  this.size = content.length
  return response.text(content)
}
```

### Resource with Authorization

```typescript
async handle({ bouncer, response }: ResourceContext) {
  await bouncer?.authorize('viewSecretDocuments')
  
  const content = await getSecretContent()
  this.size = content.length
  
  return response.text(content)
}
```

## Resource Responses

Resources can return the following content types:

### Text Content

For text-based resources (documents, JSON, XML, etc.):

```typescript
async handle({ response }: ResourceContext) {
  const content = await fs.readFile('path/to/file.txt', 'utf-8')
  return response.text(content)
}
```

### Binary Content (Blob)

For binary resources (images, PDFs, etc.), encode as base64:

```typescript
async handle({ response }: ResourceContext) {
  const content = await fs.readFile('path/to/image.png', 'base64')
  return response.blob(content)
}
```

### Error Response

Return an error to signal that the resource could not be read (e.g. not found, access denied). The client receives a JSON-RPC error response.

**Using the response helper:**

```typescript
async handle({ args, response }: ResourceContext<Args>) {
  const file = await File.findBy('name', args?.name)

  if (!file) {
    return response.error('File not found')
  }

  if (!file.isAccessible) {
    return response.error('Access denied')
  }

  this.size = file.size
  return response.text(file.content)
}
```

**Throwing a JSON-RPC exception** (for a specific error code or extra `data`): use `JsonRpcException` from `@jrmc/adonis-mcp/exceptions` and `ErrorCode` from `@jrmc/adonis-mcp/enums/error`, e.g. `throw new JsonRpcException('error', ErrorCode.InvalidParams, request.id)`. See [Tools - Error Response](/tools#error-response) for the full signature and available codes.

### Response Metadata

Add metadata to responses using `withMeta()`:

```typescript
async handle({ response }: ResourceContext) {
  const content = await getContent()
  
  return response.text(content).withMeta({
    lastModified: new Date().toISOString(),
    source: 'database',
    cached: false
  })
}
```

## Resource Annotations

Annotations provide additional metadata about your resources to help AI clients understand their characteristics.

### @priority()

Specifies the importance of a resource as a number between 0.0 and 1.0:

```typescript
import { Resource } from '@jrmc/adonis-mcp'
import { priority } from '@jrmc/adonis-mcp/annotations'

@priority(0.9)
export default class ImportantDocResource extends Resource {
  name = 'important_doc.txt'
  uri = 'file:///important_doc.txt'
  
  async handle({ response }: ResourceContext) {
    return response.text('Critical documentation content')
  }
}
```

Higher priority values (closer to 1.0) indicate more important resources that AI clients should prioritize.

### @audience()

Specifies the intended audience for a resource (user, assistant, or both):

```typescript
import { Resource } from '@jrmc/adonis-mcp'
import { audience } from '@jrmc/adonis-mcp/annotations'
import Role from '@jrmc/adonis-mcp/enums/role'

@audience(Role.USER)
export default class UserManualResource extends Resource {
  name = 'user_manual.txt'
  uri = 'file:///user_manual.txt'
  
  async handle({ response }: ResourceContext) {
    return response.text('User manual content')
  }
}
```

You can specify multiple audiences:

```typescript
@audience([Role.USER, Role.ASSISTANT])
export default class SharedDocResource extends Resource {
  // ...
}
```

Available roles:
- `Role.USER` - Content intended for end users
- `Role.ASSISTANT` - Content intended for AI assistants

### @lastModified()

Indicates when a resource was last updated (ISO 8601 timestamp):

```typescript
import { Resource } from '@jrmc/adonis-mcp'
import { lastModified } from '@jrmc/adonis-mcp/annotations'

@lastModified('2024-12-12T10:00:00Z')
export default class DocumentResource extends Resource {
  name = 'document.txt'
  uri = 'file:///document.txt'
  
  async handle({ response }: ResourceContext) {
    return response.text('Document content')
  }
}
```

You can also set this dynamically:

```typescript
export default class DynamicDocResource extends Resource {
  async handle({ response }: ResourceContext) {
    const doc = await Document.first()
    this.setAnnotation('lastModified', doc.updatedAt.toISOString())
    
    return response.text(doc.content)
  }
}
```

### Combining Resource Annotations

You can use multiple annotations on the same resource:

```typescript
import { Resource } from '@jrmc/adonis-mcp'
import { priority, audience, lastModified } from '@jrmc/adonis-mcp/annotations'
import Role from '@jrmc/adonis-mcp/enums/role'

@priority(0.8)
@audience([Role.USER, Role.ASSISTANT])
@lastModified('2024-12-12T10:00:00Z')
export default class ApiDocResource extends Resource {
  name = 'api_docs.txt'
  uri = 'file:///api_docs.txt'
  
  async handle({ response }: ResourceContext) {
    return response.text('API documentation content')
  }
}
```

## Complete Example

Here is a complete example of a resource that provides access to user documents:

```typescript
import type { ResourceContext } from '@jrmc/adonis-mcp/types/context'
import { Resource } from '@jrmc/adonis-mcp'
import { priority, audience } from '@jrmc/adonis-mcp/annotations'
import Role from '@jrmc/adonis-mcp/enums/role'
import Document from '#models/document'

type Args = {
  id: string
}

@priority(0.7)
@audience([Role.USER, Role.ASSISTANT])
export default class UserDocumentResource extends Resource<Args> {
  name = 'user_document'
  uri = 'document:///{id}'
  mimeType = 'text/plain'
  title = 'User Document'
  description = 'Access user documents by ID'

  async handle({ args, auth, response }: ResourceContext<Args>) {
    const user = auth?.user
    
    if (!user) {
      throw new Error('Authentication required')
    }
    
    const document = await Document.query()
      .where('id', args?.id)
      .where('userId', user.id)
      .firstOrFail()
    
    this.size = document.content.length
    
    return response.text(document.content).withMeta({
      documentId: document.id,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    })
  }
}
```

## Completions

Resources with URI templates can provide completions for their path parameters to help users fill in values interactively.

First, enable completions in your `config/mcp.ts`:

```typescript
import { defineConfig } from '@jrmc/adonis-mcp'

export default defineConfig({
  name: 'adonis-mcp-server',
  version: '1.0.0',
  completions: true, // Enable completions
})
```

Then implement the `complete()` method:

```typescript
import type { ResourceContext, CompleteContext } from '@jrmc/adonis-mcp/types/context'
import { Resource } from '@jrmc/adonis-mcp'

type Args = {
  directory: string
  name: string
}

export default class ConfigFileResource extends Resource<Args> {
  name = 'config_file'
  uri = 'file://{directory}/{name}.txt'
  mimeType = 'text/plain'

  async handle({ args, response }: ResourceContext<Args>) {
    const content = await readConfigFile(args?.directory, args?.name)
    return response.text(content)
  }

  async complete({ args, response }: CompleteContext<Args>) {
    // Provide suggestions based on what's being completed
    if (args?.name !== undefined) {
      return response.complete({
        values: ['config', 'settings', 'environment', 'database']
      })
    }
    
    if (args?.directory !== undefined) {
      return response.complete({
        values: ['production', 'staging', 'development']
      })
    }
    
    return response.complete({ values: [] })
  }
}
```